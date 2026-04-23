import type { Proposal } from "@sentinel/domain";
import type { ProposalStatus } from "@sentinel/domain";
import type {
	CountAllProposalsOptions,
	FindAllProposalsPaginatedOptions,
	IProposalRepository,
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

	async countByMultisigId(multisigId: string): Promise<number> {
		return this.prisma.proposal.count({ where: { multisigId } });
	}

	async findAllPaginated(
		options: FindAllProposalsPaginatedOptions,
	): Promise<Proposal[]> {
		const records = await this.prisma.proposal.findMany({
			where: options.status ? { status: options.status } : undefined,
			orderBy: { [options.sortBy]: { sort: "desc", nulls: "last" } },
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
				},
			});
			results.push(mapPrismaProposalToDomain(record));
		}

		return results;
	}
}
