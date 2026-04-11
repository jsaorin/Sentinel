import type { PublicKey } from "@solana/web3.js";
import type { DecodedInstruction } from "@sentinel/domain";

interface CompiledInstruction {
	programIdIndex: number;
	accountIndexes: Uint8Array;
	data: Uint8Array;
}

export class InstructionDecoder {
	static decode(
		allAccountKeys: PublicKey[],
		instructions: CompiledInstruction[],
	): DecodedInstruction[] {
		return instructions.map((ix: CompiledInstruction, index: number) => {
			const programId =
				ix.programIdIndex < allAccountKeys.length
					? allAccountKeys[ix.programIdIndex].toBase58()
					: `unknown(${ix.programIdIndex})`;

			const accounts = Array.from(ix.accountIndexes).map((idx) =>
				idx < allAccountKeys.length
					? allAccountKeys[idx].toBase58()
					: `unknown(${idx})`,
			);

			const data = Buffer.from(ix.data).toString("base64");

			return {
				instructionIndex: index,
				programId,
				data,
				accounts,
			};
		});
	}
}
