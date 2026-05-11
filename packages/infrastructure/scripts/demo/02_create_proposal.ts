import path from "node:path";
import { fileURLToPath } from "node:url";
import {
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
loadDotenv({ path: path.resolve(__dirname, "../../../../.env.demo") });

const MEMO_PROGRAM_ID = new PublicKey(
	"MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
);

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

	const multisigArg = process.argv[2] ?? process.env.MULTISIG_PDA;
	if (!multisigArg) {
		console.error(
			"Missing multisig PDA. Pass as first arg or export MULTISIG_PDA.",
		);
		console.error("  pnpm demo:propose <multisigPda> [memoText]");
		process.exit(1);
	}
	const multisigPda = new PublicKey(multisigArg);
	const memoText =
		process.argv[3] ?? `sentinel-demo-proposal-${new Date().toISOString()}`;

	const connection = new Connection(rpcUrl, "confirmed");

	const acc = await multisig.accounts.Multisig.fromAccountAddress(
		connection,
		multisigPda,
	);
	const transactionIndex = BigInt(Number(acc.transactionIndex) + 1);
	const [vaultPda] = multisig.getVaultPda({ multisigPda, index: 0 });

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

	console.log(
		`Creating proposal idx=${transactionIndex} on multisig ${multisigPda.toBase58()}`,
	);
	console.log(`  memo: "${memoText}"`);
	console.log(`  creator: ${payer.publicKey.toBase58()}`);
	console.log("");

	console.log("[1/2] vaultTransactionCreate");
	const sig1 = await multisig.rpc.vaultTransactionCreate({
		connection,
		feePayer: payer,
		multisigPda,
		transactionIndex,
		creator: payer.publicKey,
		vaultIndex: 0,
		ephemeralSigners: 0,
		transactionMessage: innerMessage,
		memo: memoText,
	});
	console.log(`    sig: ${sig1}`);
	await connection.confirmTransaction(sig1, "confirmed");

	console.log("[2/2] proposalCreate");
	const sig2 = await multisig.rpc.proposalCreate({
		connection,
		feePayer: payer,
		creator: payer,
		multisigPda,
		transactionIndex,
	});
	console.log(`    sig: ${sig2}`);
	await connection.confirmTransaction(sig2, "confirmed");

	const [proposalPda] = multisig.getProposalPda({
		multisigPda,
		transactionIndex,
	});
	const [transactionPda] = multisig.getTransactionPda({
		multisigPda,
		index: transactionIndex,
	});

	console.log("");
	console.log("========== PROPOSAL CREATED ==========");
	console.log(`multisigPda    : ${multisigPda.toBase58()}`);
	console.log(`txIndex        : ${transactionIndex}`);
	console.log(`proposalPda    : ${proposalPda.toBase58()}`);
	console.log(`transactionPda : ${transactionPda.toBase58()}`);
	console.log("status         : Active");
	console.log(`memo           : "${memoText}"`);
	console.log(`creator        : ${payer.publicKey.toBase58()}`);
	console.log(`vaultTx sig    : ${sig1}`);
	console.log(`proposal sig   : ${sig2}`);
	console.log(
		`proposal       : https://solscan.io/account/${proposalPda.toBase58()}`,
	);
	console.log(`tx             : https://solscan.io/tx/${sig2}`);
	console.log("======================================");
	console.log("");
	console.log("For follow-up scripts:");
	console.log(`  export PROPOSAL_PDA=${proposalPda.toBase58()}`);
	console.log(`  export TX_INDEX=${transactionIndex}`);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
