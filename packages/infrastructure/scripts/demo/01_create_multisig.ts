import path from "node:path";
import { fileURLToPath } from "node:url";
import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import * as multisig from "@sqds/multisig";
import bs58 from "bs58";
import { config as loadDotenv } from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadDotenv({ path: path.resolve(__dirname, "../../../../.env.demo") });

const THRESHOLD = 3;
const MIN_PAYER_BALANCE_SOL = 0.02;

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
	const payer = loadKeypair("DEMO_PAYER_SK");
	const member2 = loadKeypair("DEMO_MEMBER_2_SK");
	const member3 = loadKeypair("DEMO_MEMBER_3_SK");
	const member4 = loadKeypair("DEMO_MEMBER_4_SK");
	const member5 = loadKeypair("DEMO_MEMBER_5_SK");

	const connection = new Connection(rpcUrl, "confirmed");

	const balance = await connection.getBalance(payer.publicKey);
	const balanceSol = balance / LAMPORTS_PER_SOL;
	console.log(
		`Payer ${payer.publicKey.toBase58()} balance: ${balanceSol.toFixed(4)} SOL`,
	);
	if (balanceSol < MIN_PAYER_BALANCE_SOL) {
		console.error(
			`Payer balance below ${MIN_PAYER_BALANCE_SOL} SOL — fund it before running.`,
		);
		process.exit(1);
	}

	const createKey = Keypair.generate();
	const [multisigPda] = multisig.getMultisigPda({
		createKey: createKey.publicKey,
	});
	const [vaultPda] = multisig.getVaultPda({ multisigPda, index: 0 });

	const [programConfigPda] = multisig.getProgramConfigPda({});
	const programConfig =
		await multisig.accounts.ProgramConfig.fromAccountAddress(
			connection,
			programConfigPda,
		);
	const treasury = programConfig.treasury;
	const creationFeeLamports = Number(programConfig.multisigCreationFee);
	console.log(
		`Squads creation fee: ${(creationFeeLamports / LAMPORTS_PER_SOL).toFixed(6)} SOL → treasury ${treasury.toBase58()}`,
	);

	const members = [
		{ key: payer.publicKey, permissions: multisig.types.Permissions.all() },
		{ key: member2.publicKey, permissions: multisig.types.Permissions.all() },
		{ key: member3.publicKey, permissions: multisig.types.Permissions.all() },
		{ key: member4.publicKey, permissions: multisig.types.Permissions.all() },
		{ key: member5.publicKey, permissions: multisig.types.Permissions.all() },
	];

	console.log("");
	console.log("Creating Squads v4 multisig on mainnet...");
	console.log(`  multisigPda  : ${multisigPda.toBase58()}`);
	console.log(`  vaultPda (0) : ${vaultPda.toBase58()}`);
	console.log(`  threshold    : ${THRESHOLD}/${members.length}`);
	console.log(`  createKey    : ${createKey.publicKey.toBase58()} (ephemeral)`);

	const sig = await multisig.rpc.multisigCreateV2({
		connection,
		treasury,
		createKey,
		creator: payer,
		multisigPda,
		configAuthority: null,
		threshold: THRESHOLD,
		members,
		timeLock: 0,
		rentCollector: null,
		memo: `sentinel-demo-${new Date().toISOString()}`,
	});

	console.log(`tx sent: ${sig}`);
	await connection.confirmTransaction(sig, "confirmed");

	console.log("");
	console.log("========== MULTISIG CREATED ==========");
	console.log(`multisigPda  : ${multisigPda.toBase58()}`);
	console.log(`vaultPda (0) : ${vaultPda.toBase58()}`);
	console.log(`threshold    : ${THRESHOLD}/${members.length}`);
	console.log("members      :");
	for (const [i, m] of members.entries()) {
		console.log(`  [${i + 1}] ${m.key.toBase58()}`);
	}
	console.log(`tx signature : ${sig}`);
	console.log(
		`account      : https://solscan.io/account/${multisigPda.toBase58()}`,
	);
	console.log(`tx           : https://solscan.io/tx/${sig}`);
	console.log("======================================");
	console.log("");
	console.log("For follow-up scripts:");
	console.log(`  export MULTISIG_PDA=${multisigPda.toBase58()}`);
	console.log(`  export VAULT_PDA=${vaultPda.toBase58()}`);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
