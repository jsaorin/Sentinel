import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

const keypair = Keypair.generate();
const privateKeyBase58 = bs58.encode(keypair.secretKey);

console.log("");
console.log("=== Sentinel test signer ===");
console.log("PUBLIC KEY:  " + keypair.publicKey.toBase58());
console.log("PRIVATE KEY: " + privateKeyBase58);
console.log("");
console.log("Next steps:");
console.log("  1. Add to .env.local:");
console.log("       TEST_SIGNER_PRIVATE_KEY=" + privateKeyBase58);
console.log("  2. Fund the public key with ~0.05 SOL on mainnet (fees only).");
console.log("  3. Add the public key as a member of the multisig in Squads UI");
console.log("     with permission mask 7 (initiate + vote + execute).");
console.log("");
