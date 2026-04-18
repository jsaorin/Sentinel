export class DecodedInstructionDto {
	instructionIndex: number;
	programId: string;
	programName: string;
	action: string;
	params: Record<string, string>;
	accounts: Array<{ address: string; label: string }>;
	rawData: string;
	isKnown: boolean;
}
