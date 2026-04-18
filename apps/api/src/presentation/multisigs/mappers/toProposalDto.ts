import type { ListProposalsQueryOutputProposal } from "@sentinel/application";
import type { ProposalDto } from "@sentinel/common/dtos";

export function toProposalDto(
	proposal: ListProposalsQueryOutputProposal,
): ProposalDto {
	return {
		id: proposal.id,
		proposalIndex: proposal.proposalIndex,
		transactionIndex: proposal.transactionIndex,
		pda: proposal.pda,
		transactionPda: proposal.transactionPda,
		status: proposal.status,
		creator: proposal.creator,
		createdAt: proposal.createdAt.toISOString(),
		executedAt: proposal.executedAt ? proposal.executedAt.toISOString() : null,
		riskScore: proposal.riskScore,
		summary: proposal.summary,
		instructions: proposal.instructions,
	};
}
