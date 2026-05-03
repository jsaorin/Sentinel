import type { Proposal } from "@sentinel/domain";
import type { ProposalStatus } from "@sentinel/domain";
import type {
	CountAllProposalsOptions,
	FindAllProposalsPaginatedOptions,
	IProposalRepository,
	UpdateProposalData,
} from "@sentinel/domain/repositories";
import { injectable } from "inversify";
import { mapPrismaProposalToDomain } from "../mappers/ProposalMapper.js";
import { getPrismaClient } from "../prisma/prisma-client-factory.js";

@injectable()
export class ProposalRepository implements IProposalRepository {
	private get prisma() {
		return getPrismaClient();
	}

	async findById(id: string): Promise<Proposal | null> {
		const record = await this.prisma.proposal.findUnique({ where: { id } });
		return record ? mapPrismaProposalToDomain(record) : null;
	}

	async findByMultisigId(multisigId: string): Promise<Proposal[]> {
		const records = await this.prisma.proposal.findMany({
			where: { multisigId },
			orderBy: { proposalIndex: "asc" },
		});
		return records.map(mapPrismaProposalToDomain);
	}

	async findByMultisigIdPaginated(
		multisigId: string,
		options: { skip: number; take: number },
	): Promise<Proposal[]> {
		const records = await this.prisma.proposal.findMany({
			where: { multisigId },
			orderBy: { proposalIndex: "desc" },
			skip: options.skip,
			take: options.take,
		});
		return records.map(mapPrismaProposalToDomain);
	}

	async findByMultisigIdAndIndices(
		multisigId: string,
		indices: number[],
	): Promise<Proposal[]> {
		if (indices.length === 0) return [];
		const records = await this.prisma.proposal.findMany({
			where: { multisigId, proposalIndex: { in: indices } },
		});
		return records.map(mapPrismaProposalToDomain);
	}

	async countByMultisigId(multisigId: string): Promise<number> {
		return this.prisma.proposal.count({ where: { multisigId } });
	}

	async findAllPaginated(
		options: FindAllProposalsPaginatedOptions,
	): Promise<Proposal[]> {
		const orderBy =
			options.sortBy === "executedAt"
				? { executedAt: { sort: "desc", nulls: "last" } as const }
				: { createdAt: "desc" as const };
		const records = await this.prisma.proposal.findMany({
			where: options.status ? { status: options.status } : undefined,
			orderBy,
			skip: options.skip,
			take: options.take,
		});
		return records.map(mapPrismaProposalToDomain);
	}

	async countAll(options: CountAllProposalsOptions): Promise<number> {
		return this.prisma.proposal.count({
			where: options.status ? { status: options.status } : undefined,
		});
	}

	async findLatestByMultisigId(multisigId: string): Promise<Proposal | null> {
		const record = await this.prisma.proposal.findFirst({
			where: { multisigId },
			orderBy: { proposalIndex: "desc" },
		});
		return record ? mapPrismaProposalToDomain(record) : null;
	}

	async createMany(
		proposals: Array<{
			multisigId: string;
			proposalIndex: number;
			transactionIndex: number;
			pda: string;
			transactionPda: string;
			status: ProposalStatus;
			creator: string | null;
			createdAt: Date;
			executedAt: Date | null;
			approvers?: string[];
			rejecters?: string[];
			cancellers?: string[];
		}>,
	): Promise<Proposal[]> {
		const results: Proposal[] = [];

		for (const proposal of proposals) {
			const record = await this.prisma.proposal.create({
				data: {
					multisigId: proposal.multisigId,
					proposalIndex: proposal.proposalIndex,
					transactionIndex: proposal.transactionIndex,
					pda: proposal.pda,
					transactionPda: proposal.transactionPda,
					status: proposal.status,
					creator: proposal.creator,
					createdAt: proposal.createdAt,
					executedAt: proposal.executedAt,
					approvers: proposal.approvers ?? [],
					rejecters: proposal.rejecters ?? [],
					cancellers: proposal.cancellers ?? [],
				},
			});
			results.push(mapPrismaProposalToDomain(record));
		}

		return results;
	}

	async update(id: string, data: UpdateProposalData): Promise<Proposal> {
		const record = await this.prisma.proposal.update({
			where: { id },
			data: {
				...(data.status !== undefined && { status: data.status }),
				...(data.approvers !== undefined && { approvers: data.approvers }),
				...(data.rejecters !== undefined && { rejecters: data.rejecters }),
				...(data.cancellers !== undefined && { cancellers: data.cancellers }),
				...(data.executedAt !== undefined && { executedAt: data.executedAt }),
			},
		});
		return mapPrismaProposalToDomain(record);
	}
}
