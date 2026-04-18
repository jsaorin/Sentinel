import { injectable } from "inversify";
import type {
	DecodedInstructionData,
	IInstructionDecoderService,
	ProposalInstruction,
} from "@sentinel/domain";
import { getProgramName } from "./ProgramRegistry.js";
import { parseInstruction } from "./InstructionParser.js";
import { labelAccounts } from "./AccountLabeler.js";
import { generateSummary } from "./SummaryGenerator.js";

@injectable()
export class InstructionDecoderService implements IInstructionDecoderService {
	decode(instructions: ProposalInstruction[]): DecodedInstructionData[] {
		return instructions.map((ix) => {
			const programName = getProgramName(ix.programId) ?? "Unknown Program";
			const parsed = parseInstruction(ix.programId, ix.data, ix.accounts);
			const isKnown = parsed !== null;
			const action = parsed?.action ?? "Unknown";
			const params = parsed?.params ?? {};
			const accounts = isKnown
				? labelAccounts(programName, action, ix.accounts)
				: ix.accounts.map((a, i) => ({ address: a, label: `account_${i}` }));
			const summary = generateSummary(programName, action, params, accounts);

			return {
				proposalInstructionId: ix.id,
				programName,
				action,
				params,
				accounts,
				summary,
				isKnown,
			};
		});
	}
}
