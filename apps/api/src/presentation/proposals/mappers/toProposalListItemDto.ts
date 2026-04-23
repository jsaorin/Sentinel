import type { ListProposalsFeedQueryOutputItem } from "@sentinel/application";
import type { ProposalListItemDto } from "@sentinel/common/dtos";

export function toProposalListItemDto(
	item: ListProposalsFeedQueryOutputItem,
): ProposalListItemDto {
	return {
		id: item.id,
		proposalIndex: item.proposalIndex,
		transactionIndex: item.transactionIndex,
		pda: item.pda,
		transactionPda: item.transactionPda,
		status: item.status,
		creator: item.creator,
		createdAt: item.createdAt.toISOString(),
		executedAt: item.executedAt ? item.executedAt.toISOString() : null,
		riskScore: item.riskScore,
		summary: item.summary,
		multisig: {
			address: item.multisig.address,
			label: item.multisig.label,
		},
	};
}
