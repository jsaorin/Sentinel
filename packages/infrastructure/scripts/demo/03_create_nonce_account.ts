import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	Connection,
	Keypair,
	LAMPORTS_PER_SOL,
	NONCE_ACCOUNT_LENGTH,
	SystemProgram,
	Transaction,
	sendAndConfirmTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";
import { config as loadDotenv } from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadDotenv({ path: path.resolve(__dirname, "../../../../.env.demo") });

const MEMBER_ENV_BY_INDEX: Record<string, string> = {
	"1": "DEMO_PAYER_SK",
	"2": "DEMO_MEMBER_2_SK",
	"3": "DEMO_MEMBER_3_SK",
	"4": "DEMO_MEMBER_4_SK",
	"5": "DEMO_MEMBER_5_SK",
};

function requireEnv(name: string): string {
	const v = process.env[name];
	if (!v || v.trim() === "") {
		console.error(`Missing ${name} in .env.demo`);
		process.exit(1);
	}
	return v;
}

function loadKeypair(envName: string): Keypair {
	return Keypair.fromSecretKey(bs58.decode(requireEnv(envName)));
}

async function main() {
	const rpcUrl = requireEnv("SOLANA_RPC_URL");
	const attacker = loadKeypair("DEMO_ATTACKER_SK");

	const memberArg = process.argv[2] ?? "2";
	const memberEnv = MEMBER_ENV_BY_INDEX[memberArg];
	if (!memberEnv) {
		console.error(
			`Invalid member index "${memberArg}". Choose 1, 2, 3, 4 or 5.`,
		);
		process.exit(1);
	}
	const authority = loadKeypair(memberEnv);

	const connection = new Connection(rpcUrl, "confirmed");

	const rentLamports =
		await connection.getMinimumBalanceForRentExemption(NONCE_ACCOUNT_LENGTH);
	const minAttackerBalance = rentLamports + 10_000;

	const attackerBalance = await connection.getBalance(attacker.publicKey);
	if (attackerBalance < minAttackerBalance) {
		console.error(
			`Attacker ${attacker.publicKey.toBase58()} has only ${(attackerBalance / LAMPORTS_PER_SOL).toFixed(6)} SOL — needs at least ${(minAttackerBalance / LAMPORTS_PER_SOL).toFixed(6)} SOL (rent + tx fee). Fund it before running.`,
		);
		process.exit(1);
	}

	const nonceAccount = Keypair.generate();

	console.log("Setup:");
	console.log(
		`  attacker (funder)   : ${attacker.publicKey.toBase58()}  [EXTERNAL — not a multisig member]`,
	);
	console.log(
		`    balance           : ${(attackerBalance / LAMPORTS_PER_SOL).toFixed(6)} SOL`,
	);
	console.log(
		`  authority (target)  : ${authority.publicKey.toBase58()}  [multisig member ${memberArg}]`,
	);
	console.log(`  nonce account       : ${nonceAccount.publicKey.toBase58()}`);
	console.log(
		`  rent for nonce      : ${(rentLamports / LAMPORTS_PER_SOL).toFixed(6)} SOL`,
	);
	console.log("");

	console.log("Attacker creates nonce account, authority = multisig member");
	const createNonceTx = new Transaction().add(
		SystemProgram.createAccount({
			fromPubkey: attacker.publicKey,
			newAccountPubkey: nonceAccount.publicKey,
			lamports: rentLamports,
			space: NONCE_ACCOUNT_LENGTH,
			programId: SystemProgram.programId,
		}),
		SystemProgram.nonceInitialize({
			noncePubkey: nonceAccount.publicKey,
			authorizedPubkey: authority.publicKey,
		}),
	);
	const createSig = await sendAndConfirmTransaction(connection, createNonceTx, [
		attacker,
		nonceAccount,
	]);
	console.log(`    sig: ${createSig}`);

	let onChainNonce = null;
	for (let attempt = 1; attempt <= 8 && !onChainNonce; attempt++) {
		onChainNonce = await connection.getNonce(
			nonceAccount.publicKey,
			"confirmed",
		);
		if (!onChainNonce) {
			await new Promise((r) => setTimeout(r, 1000));
		}
	}

	console.log("");
	console.log("========== NONCE ACCOUNT CREATED ==========");
	console.log(`nonceAccount     : ${nonceAccount.publicKey.toBase58()}`);
	console.log(
		`authority         : ${onChainNonce ? onChainNonce.authorizedPubkey.toBase58() : authority.publicKey.toBase58()}  [member ${memberArg}]`,
	);
	console.log(
		`funder (external) : ${attacker.publicKey.toBase58()}  [NOT a multisig member]`,
	);
	if (onChainNonce) {
		console.log(`nonce value       : ${onChainNonce.nonce}`);
	} else {
		console.log(
			"nonce value       : <RPC lag — verify manually via the explorer link below>",
		);
	}
	console.log(`create tx         : https://solscan.io/tx/${createSig}`);
	console.log(
		`nonce account     : https://solscan.io/account/${nonceAccount.publicKey.toBase58()}`,
	);
	console.log("============================================");
	console.log("");
	console.log(
		"Expected Sentinel reaction: EXTERNAL_NONCE_FUNDER (CRITICAL) — funder is not a member",
	);
	console.log(
		"of the multisig. This mirrors the Drift Protocol pre-staging pattern.",
	);
	console.log("");
	console.log("For follow-up scripts:");
	console.log(`  export NONCE_ACCOUNT=${nonceAccount.publicKey.toBase58()}`);
	console.log(`  export NONCE_AUTHORITY=${authority.publicKey.toBase58()}`);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
