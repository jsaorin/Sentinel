import type { GetProposalDetailQueryOutputDto } from "@sentinel/application";
import type {
	ProposalDetailDto,
	ProposalFlagDto,
} from "@sentinel/common/dtos";
import { toDecodedInstructionDto } from "./toDecodedInstructionDto.js";
import { toProposalSignerDto } from "./toProposalSignerDto.js";

export function toProposalDetailDto(
	output: GetProposalDetailQueryOutputDto,
): ProposalDetailDto {
	return {
		id: output.id,
		proposalIndex: output.proposalIndex,
		transactionIndex: output.transactionIndex,
		status: output.status,
		creator: output.creator,
		createdAt: output.createdAt.toISOString(),
		executedAt: output.executedAt ? output.executedAt.toISOString() : null,

		multisig: {
			address: output.multisig.address,
			label: output.multisig.label,
			threshold: output.multisig.threshold,
			totalSigners: output.multisig.totalSigners,
		},

		scoring: output.scoring
			? {
					riskScore: output.scoring.riskScore,
					flags: output.scoring.flags.map<ProposalFlagDto>((flag) => ({
						type: flag.type,
						severity: flag.severity,
						points: flag.points,
						detail: flag.detail,
					})),
					summary: output.scoring.summary,
					calculatedAt: output.scoring.calculatedAt.toISOString(),
				}
			: null,

		ai: output.ai
			? {
					analysis: output.ai.analysis,
					recommendation: output.ai.recommendation,
				}
			: null,

		signers: output.signers.map(toProposalSignerDto),

		instructions: output.instructions.map(toDecodedInstructionDto),
	};
}
