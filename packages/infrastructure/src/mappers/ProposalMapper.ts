import type { Proposal as PrismaProposal } from "../../generated/client/index.js";
import { Proposal, type ProposalStatus } from "@sentinel/domain";

export function mapPrismaProposalToDomain(record: PrismaProposal): Proposal {
	return new Proposal({
		id: record.id,
		multisigId: record.multisigId,
		proposalIndex: record.proposalIndex,
		transactionIndex: record.transactionIndex,
		pda: record.pda,
		transactionPda: record.transactionPda,
		status: record.status as ProposalStatus,
		creator: record.creator,
		createdAt: record.createdAt,
		executedAt: record.executedAt,
	});
}
