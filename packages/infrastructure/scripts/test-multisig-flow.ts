import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	ComputeBudgetProgram,
	Connection,
	Keypair,
	PublicKey,
	TransactionInstruction,
	TransactionMessage,
} from "@solana/web3.js";
import * as multisig from "@sqds/multisig";
import bs58 from "bs58";
import { config as loadDotenv } from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../..");
loadDotenv({ path: path.join(repoRoot, ".env.local") });

const MEMO_PROGRAM_ID = new PublicKey(
	"MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
);

interface Env {
	signer: Keypair;
	multisigPda: PublicKey;
	apiBaseUrl: string;
	connection: Connection;
}

function loadEnv(): Env {
	const privateKey = process.env.TEST_SIGNER_PRIVATE_KEY;
	const multisigAddress = process.env.TEST_MULTISIG_ADDRESS;
	const apiBaseUrl = process.env.TEST_API_BASE_URL;
	const heliusApiKey = process.env.HELIUS_API_KEY;

	if (!privateKey) throw new Error("TEST_SIGNER_PRIVATE_KEY is not set");
	if (!multisigAddress) throw new Error("TEST_MULTISIG_ADDRESS is not set");
	if (!apiBaseUrl) throw new Error("TEST_API_BASE_URL is not set");
	if (!heliusApiKey) throw new Error("HELIUS_API_KEY is not set");

	const signer = Keypair.fromSecretKey(bs58.decode(privateKey));
	const rpcUrl = `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`;

	return {
		signer,
		multisigPda: new PublicKey(multisigAddress),
		apiBaseUrl: apiBaseUrl.replace(/\/$/, ""),
		connection: new Connection(rpcUrl, "confirmed"),
	};
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function getMultisigState(env: Env) {
	const acc = await multisig.accounts.Multisig.fromAccountAddress(
		env.connection,
		env.multisigPda,
	);
	const txIndex = Number(acc.transactionIndex);
	return {
		threshold: acc.threshold,
		members: acc.members.map((m) => ({
			address: m.key.toBase58(),
			mask: m.permissions.mask,
		})),
		transactionIndex: txIndex,
	};
}

interface ApiEnvelope<T> {
	message: string;
	data: T;
}
interface ProposalApi {
	id: string;
	proposalIndex: number;
	transactionIndex: number;
	status: string;
	creator: string | null;
	executedAt: string | null;
	createdAt: string;
}
interface SignerApi {
	id: string;
	address: string;
	permissions: { mask: number };
}
interface MultisigApi {
	id: string;
	address: string;
	threshold: number | null;
	configAuthority: string | null;
	totalSigners: number;
}

async function apiGet<T>(env: Env, urlPath: string): Promise<T> {
	const url = `${env.apiBaseUrl}${urlPath}`;
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(
			`GET ${urlPath} → ${res.status} ${res.statusText}: ${await res.text()}`,
		);
	}
	const body = (await res.json()) as ApiEnvelope<T>;
	return body.data;
}

async function fetchSigners(env: Env): Promise<SignerApi[]> {
	return apiGet<SignerApi[]>(
		env,
		`/multisigs/${env.multisigPda.toBase58()}/signers`,
	);
}

async function fetchProposals(env: Env): Promise<ProposalApi[]> {
	const data = await apiGet<{ proposals: ProposalApi[] }>(
		env,
		`/multisigs/${env.multisigPda.toBase58()}/proposals?page=1&pageSize=50`,
	);
	return data.proposals;
}

async function fetchMultisig(env: Env): Promise<MultisigApi> {
	return apiGet<MultisigApi>(env, `/multisigs/${env.multisigPda.toBase58()}`);
}

async function pollProposal(
	env: Env,
	transactionIndex: number,
	predicate: (p: ProposalApi) => boolean,
	predicateLabel: string,
	timeoutMs = 60_000,
): Promise<{ proposal: ProposalApi; elapsedMs: number }> {
	const start = Date.now();
	let lastSeen: ProposalApi | null = null;
	while (Date.now() - start < timeoutMs) {
		try {
			const proposals = await fetchProposals(env);
			const found = proposals.find(
				(p) => p.transactionIndex === transactionIndex,
			);
			if (found) {
				lastSeen = found;
				if (predicate(found)) {
					return { proposal: found, elapsedMs: Date.now() - start };
				}
			}
		} catch (err) {
			console.log(`  poll error: ${(err as Error).message}`);
		}
		await sleep(2_000);
	}
	throw new Error(
		`Timeout waiting for proposal idx=${transactionIndex} to satisfy: ${predicateLabel}. Last seen: ${
			lastSeen ? JSON.stringify(lastSeen) : "not found"
		}`,
	);
}

async function pollSigner(
	env: Env,
	signerAddress: string,
	predicate: (signers: SignerApi[]) => boolean,
	predicateLabel: string,
	timeoutMs = 60_000,
): Promise<{ signers: SignerApi[]; elapsedMs: number }> {
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		try {
			const signers = await fetchSigners(env);
			if (predicate(signers)) {
				return { signers, elapsedMs: Date.now() - start };
			}
		} catch (err) {
			console.log(`  poll error: ${(err as Error).message}`);
		}
		await sleep(2_000);
	}
	throw new Error(
		`Timeout waiting for signer ${signerAddress} predicate: ${predicateLabel}`,
	);
}

async function confirm(env: Env, sig: string) {
	const latestBlockhash = await env.connection.getLatestBlockhash();
	await env.connection.confirmTransaction(
		{
			signature: sig,
			blockhash: latestBlockhash.blockhash,
			lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
		},
		"confirmed",
	);
}

async function cmdInfo(env: Env): Promise<void> {
	console.log("Reading multisig state...");
	const onChain = await getMultisigState(env);
	console.log("");
	console.log("On-chain:");
	console.log(`  threshold: ${onChain.threshold}`);
	console.log(`  transactionIndex: ${onChain.transactionIndex}`);
	console.log(`  members (${onChain.members.length}):`);
	for (const m of onChain.members) {
		console.log(`    - ${m.address}  mask=${m.mask}`);
	}

	console.log("");
	console.log("DB (via API):");
	const [dbMs, dbSigners, dbProposals] = await Promise.all([
		fetchMultisig(env),
		fetchSigners(env),
		fetchProposals(env),
	]);
	console.log(
		`  multisig: threshold=${dbMs.threshold} totalSigners=${dbMs.totalSigners}`,
	);
	console.log(`  signers (${dbSigners.length}):`);
	for (const s of dbSigners) {
		console.log(`    - ${s.address}  mask=${s.permissions.mask}`);
	}
	console.log(`  proposals: ${dbProposals.length} stored`);
	if (dbProposals.length > 0) {
		const last = dbProposals[0];
		console.log(
			`    latest: idx=${last.transactionIndex} status=${last.status} creator=${last.creator}`,
		);
	}

	console.log("");
	const ourAddr = env.signer.publicKey.toBase58();
	const onChainHasSigner = onChain.members.some((m) => m.address === ourAddr);
	const dbHasSigner = dbSigners.some((s) => s.address === ourAddr);
	console.log(`Our test signer: ${ourAddr}`);
	console.log(
		`  on-chain: ${onChainHasSigner ? "YES" : "NO"}    db: ${dbHasSigner ? "YES" : "NO"}`,
	);
	if (!onChainHasSigner) {
		console.log(
			"  → Add the public key as a member of the multisig in Squads UI to continue.",
		);
	} else if (!dbHasSigner) {
		console.log(
			"  → Signer is on-chain but not yet in DB. Webhook sync may still be in flight.",
		);
	} else {
		console.log("  → Ready to run vault-flow / config-flow.");
	}
}

async function cmdVaultFlow(env: Env, memoText: string): Promise<void> {
	const ourAddr = env.signer.publicKey.toBase58();
	console.log(`Vault-flow start. Memo="${memoText}"`);

	const onChain = await getMultisigState(env);
	const transactionIndex = BigInt(onChain.transactionIndex + 1);
	console.log(`Next transactionIndex=${transactionIndex}`);

	const [vaultPda] = multisig.getVaultPda({
		multisigPda: env.multisigPda,
		index: 0,
	});

	const memoIx = new TransactionInstruction({
		programId: MEMO_PROGRAM_ID,
		keys: [],
		data: Buffer.from(memoText, "utf-8"),
	});

	const innerMessage = new TransactionMessage({
		payerKey: vaultPda,
		recentBlockhash: PublicKey.default.toBase58(),
		instructions: [memoIx],
	});

	console.log("");
	console.log("[tx1] vaultTransactionCreate + proposalCreate");
	const sig1Vault = await multisig.rpc.vaultTransactionCreate({
		connection: env.connection,
		feePayer: env.signer,
		multisigPda: env.multisigPda,
		transactionIndex,
		creator: env.signer.publicKey,
		vaultIndex: 0,
		ephemeralSigners: 0,
		transactionMessage: innerMessage,
		memo: memoText,
	});
	console.log(`  vaultTransactionCreate sig: ${sig1Vault}`);
	await confirm(env, sig1Vault);

	const sig1Prop = await multisig.rpc.proposalCreate({
		connection: env.connection,
		feePayer: env.signer,
		creator: env.signer,
		multisigPda: env.multisigPda,
		transactionIndex,
	});
	console.log(`  proposalCreate sig:        ${sig1Prop}`);
	await confirm(env, sig1Prop);

	const created = await pollProposal(
		env,
		Number(transactionIndex),
		(p) => p.status === "ACTIVE" || p.status === "APPROVED",
		"status=ACTIVE",
	);
	console.log(
		`  [DB] proposal idx=${created.proposal.transactionIndex} status=${created.proposal.status} creator=${created.proposal.creator} (sync delay: ${(created.elapsedMs / 1000).toFixed(1)}s)`,
	);

	console.log("");
	console.log("[tx2] proposalApprove");
	const sig2 = await multisig.rpc.proposalApprove({
		connection: env.connection,
		feePayer: env.signer,
		member: env.signer,
		multisigPda: env.multisigPda,
		transactionIndex,
	});
	console.log(`  sig: ${sig2}`);
	await confirm(env, sig2);

	const approved = await pollProposal(
		env,
		Number(transactionIndex),
		(p) => p.status === "APPROVED",
		"status=APPROVED (threshold=1 reached)",
	);
	console.log(
		`  [DB] status=${approved.proposal.status} (sync delay: ${(approved.elapsedMs / 1000).toFixed(1)}s)`,
	);

	console.log("");
	console.log("[tx3] vaultTransactionExecute");
	const computeIx = ComputeBudgetProgram.setComputeUnitLimit({
		units: 400_000,
	});
	const executeIx = await multisig.instructions.vaultTransactionExecute({
		connection: env.connection,
		multisigPda: env.multisigPda,
		transactionIndex,
		member: env.signer.publicKey,
	});
	const blockhash = (await env.connection.getLatestBlockhash()).blockhash;
	const executeMessage = new TransactionMessage({
		payerKey: env.signer.publicKey,
		recentBlockhash: blockhash,
		instructions: [computeIx, executeIx.instruction],
	}).compileToV0Message(executeIx.lookupTableAccounts);
	const { VersionedTransaction } = await import("@solana/web3.js");
	const versionedTx = new VersionedTransaction(executeMessage);
	versionedTx.sign([env.signer]);
	const sig3 = await env.connection.sendTransaction(versionedTx);
	console.log(`  sig: ${sig3}`);
	await confirm(env, sig3);

	const executed = await pollProposal(
		env,
		Number(transactionIndex),
		(p) => p.status === "EXECUTED" && p.executedAt !== null,
		"status=EXECUTED",
	);
	console.log(
		`  [DB] status=${executed.proposal.status} executedAt=${executed.proposal.executedAt} (sync delay: ${(executed.elapsedMs / 1000).toFixed(1)}s)`,
	);

	console.log("");
	console.log(`[OK] proposal idx=${transactionIndex} executed by ${ourAddr}`);
}

async function runConfigFlow(
	env: Env,
	action: multisig.types.ConfigAction,
	label: string,
	postExecuteCheck?: () => Promise<void>,
): Promise<void> {
	const onChain = await getMultisigState(env);
	const transactionIndex = BigInt(onChain.transactionIndex + 1);
	console.log(
		`config-flow ${label}. Next transactionIndex=${transactionIndex}`,
	);

	console.log("");
	console.log("[tx1] configTransactionCreate + proposalCreate");
	const sig1Cfg = await multisig.rpc.configTransactionCreate({
		connection: env.connection,
		feePayer: env.signer,
		multisigPda: env.multisigPda,
		transactionIndex,
		creator: env.signer.publicKey,
		actions: [action],
	});
	console.log(`  configTransactionCreate sig: ${sig1Cfg}`);
	await confirm(env, sig1Cfg);

	const sig1Prop = await multisig.rpc.proposalCreate({
		connection: env.connection,
		feePayer: env.signer,
		creator: env.signer,
		multisigPda: env.multisigPda,
		transactionIndex,
	});
	console.log(`  proposalCreate sig:          ${sig1Prop}`);
	await confirm(env, sig1Prop);

	const created = await pollProposal(
		env,
		Number(transactionIndex),
		(p) => p.status === "ACTIVE" || p.status === "APPROVED",
		"status=ACTIVE",
	);
	console.log(
		`  [DB] proposal idx=${created.proposal.transactionIndex} status=${created.proposal.status} (sync delay: ${(created.elapsedMs / 1000).toFixed(1)}s)`,
	);

	console.log("");
	console.log("[tx2] proposalApprove");
	const sig2 = await multisig.rpc.proposalApprove({
		connection: env.connection,
		feePayer: env.signer,
		member: env.signer,
		multisigPda: env.multisigPda,
		transactionIndex,
	});
	console.log(`  sig: ${sig2}`);
	await confirm(env, sig2);

	const approved = await pollProposal(
		env,
		Number(transactionIndex),
		(p) => p.status === "APPROVED",
		"status=APPROVED",
	);
	console.log(
		`  [DB] status=${approved.proposal.status} (sync delay: ${(approved.elapsedMs / 1000).toFixed(1)}s)`,
	);

	console.log("");
	console.log("[tx3] configTransactionExecute");
	const sig3 = await multisig.rpc.configTransactionExecute({
		connection: env.connection,
		feePayer: env.signer,
		multisigPda: env.multisigPda,
		transactionIndex,
		member: env.signer,
		rentPayer: env.signer,
	});
	console.log(`  sig: ${sig3}`);
	await confirm(env, sig3);

	const executed = await pollProposal(
		env,
		Number(transactionIndex),
		(p) => p.status === "EXECUTED" && p.executedAt !== null,
		"status=EXECUTED",
	);
	console.log(
		`  [DB] status=${executed.proposal.status} executedAt=${executed.proposal.executedAt} (sync delay: ${(executed.elapsedMs / 1000).toFixed(1)}s)`,
	);

	if (postExecuteCheck) {
		await postExecuteCheck();
	}

	console.log("");
	console.log(`[OK] config-flow ${label} idx=${transactionIndex} executed`);
}

async function cmdConfigAdd(env: Env, newSignerPubkey: string): Promise<void> {
	const newKey = new PublicKey(newSignerPubkey);
	const action: multisig.types.ConfigAction = {
		__kind: "AddMember",
		newMember: { key: newKey, permissions: { mask: 7 } },
	};
	await runConfigFlow(env, action, `add ${newSignerPubkey}`, async () => {
		const { signers, elapsedMs } = await pollSigner(
			env,
			newSignerPubkey,
			(list) => list.some((s) => s.address === newSignerPubkey),
			"signer present",
		);
		console.log(
			`  [DB] signer ${newSignerPubkey} present (${signers.length} total, sync delay: ${(elapsedMs / 1000).toFixed(1)}s)`,
		);
	});
}

async function cmdConfigRemove(env: Env, signerPubkey: string): Promise<void> {
	const oldKey = new PublicKey(signerPubkey);
	const action: multisig.types.ConfigAction = {
		__kind: "RemoveMember",
		oldMember: oldKey,
	};
	await runConfigFlow(env, action, `remove ${signerPubkey}`, async () => {
		const { signers, elapsedMs } = await pollSigner(
			env,
			signerPubkey,
			(list) => !list.some((s) => s.address === signerPubkey),
			"signer absent",
		);
		console.log(
			`  [DB] signer ${signerPubkey} removed (${signers.length} total, sync delay: ${(elapsedMs / 1000).toFixed(1)}s)`,
		);
	});
}

async function cmdWatch(env: Env, transactionIndex: number): Promise<void> {
	console.log(`Watching proposal idx=${transactionIndex} (Ctrl+C to stop)`);
	let lastSerialized = "";
	while (true) {
		try {
			const proposals = await fetchProposals(env);
			const found = proposals.find(
				(p) => p.transactionIndex === transactionIndex,
			);
			const serialized = found
				? `status=${found.status} approvers/executed=${found.executedAt}`
				: "(not in DB)";
			if (serialized !== lastSerialized) {
				console.log(
					`[${new Date().toISOString()}] ${found ? `id=${found.id} ${serialized}` : serialized}`,
				);
				lastSerialized = serialized;
			}
		} catch (err) {
			console.log(`poll error: ${(err as Error).message}`);
		}
		await sleep(2_000);
	}
}

function usage(): never {
	console.log("Usage:");
	console.log("  test-multisig-flow info");
	console.log("  test-multisig-flow vault-flow [memo-text]");
	console.log("  test-multisig-flow config-flow add <pubkey>");
	console.log("  test-multisig-flow config-flow remove <pubkey>");
	console.log("  test-multisig-flow watch <transactionIndex>");
	process.exit(1);
}

async function main(): Promise<void> {
	const argv = process.argv.slice(2);
	const cmd = argv[0];
	if (!cmd) usage();

	const env = loadEnv();

	if (cmd === "info") {
		await cmdInfo(env);
	} else if (cmd === "vault-flow") {
		const memo = argv[1] ?? `sentinel-realtime-test-${Date.now()}`;
		await cmdVaultFlow(env, memo);
	} else if (cmd === "config-flow") {
		const sub = argv[1];
		const pubkey = argv[2];
		if (!sub || !pubkey) usage();
		if (sub === "add") await cmdConfigAdd(env, pubkey);
		else if (sub === "remove") await cmdConfigRemove(env, pubkey);
		else usage();
	} else if (cmd === "watch") {
		const idx = Number(argv[1]);
		if (!Number.isFinite(idx)) usage();
		await cmdWatch(env, idx);
	} else {
		usage();
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
