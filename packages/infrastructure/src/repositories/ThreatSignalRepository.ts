import type {
	AffectedEntity,
	CountThreatSignalsOptions,
	ThreatSignal as DomainThreatSignal,
	FindAllThreatSignalsPaginatedOptions,
	IThreatSignalRepository,
	ThreatSource,
} from "@sentinel/domain";
import { injectable } from "inversify";
import type { Prisma } from "../../generated/client/index.js";
import { mapPrismaThreatSignalToDomain } from "../mappers/ThreatSignalMapper.js";
import { getPrismaClient } from "../prisma/prisma-client-factory.js";

@injectable()
export class ThreatSignalRepository implements IThreatSignalRepository {
	private get prisma() {
		return getPrismaClient();
	}

	async findById(id: string): Promise<DomainThreatSignal | null> {
		const record = await this.prisma.threatSignal.findUnique({
			where: { id },
			include: { entities: true },
		});
		return record ? mapPrismaThreatSignalToDomain(record) : null;
	}

	async findByExternalRef(
		source: ThreatSource,
		externalId: string,
	): Promise<DomainThreatSignal | null> {
		const record = await this.prisma.threatSignal.findUnique({
			where: {
				sourceKind_sourceIdentifier_externalId: {
					sourceKind: source.kind,
					sourceIdentifier: source.identifier,
					externalId,
				},
			},
			include: { entities: true },
		});
		return record ? mapPrismaThreatSignalToDomain(record) : null;
	}

	async save(signal: DomainThreatSignal): Promise<DomainThreatSignal> {
		const rawAnalysis = signal.rawAnalysisJson as Prisma.InputJsonValue | null;

		const record = await this.prisma.$transaction(async (tx) => {
			const upserted = await tx.threatSignal.upsert({
				where: {
					sourceKind_sourceIdentifier_externalId: {
						sourceKind: signal.source.kind,
						sourceIdentifier: signal.source.identifier,
						externalId: signal.externalId,
					},
				},
				create: {
					sourceKind: signal.source.kind,
					sourceIdentifier: signal.source.identifier,
					sourceLabel: signal.source.label ?? null,
					sourceUrl: signal.sourceUrl,
					externalId: signal.externalId,
					content: signal.content,
					capturedAt: signal.capturedAt,
					isThreat: signal.isThreat,
					severity: signal.severity,
					category: signal.category,
					summary: signal.summary,
					rawAnalysisJson: rawAnalysis ?? undefined,
					analyzedAt: signal.analyzedAt,
				},
				update: {
					sourceLabel: signal.source.label ?? null,
					sourceUrl: signal.sourceUrl,
					content: signal.content,
					capturedAt: signal.capturedAt,
					isThreat: signal.isThreat,
					severity: signal.severity,
					category: signal.category,
					summary: signal.summary,
					rawAnalysisJson: rawAnalysis ?? undefined,
					analyzedAt: signal.analyzedAt,
				},
			});

			await tx.threatSignalEntity.deleteMany({
				where: { threatSignalId: upserted.id },
			});

			if (signal.entities.length > 0) {
				await tx.threatSignalEntity.createMany({
					data: signal.entities.map((entity: AffectedEntity) => ({
						threatSignalId: upserted.id,
						kind: entity.kind,
						role: entity.role,
						address: entity.address,
						contextSnippet: entity.contextSnippet,
					})),
					skipDuplicates: true,
				});
			}

			return tx.threatSignal.findUniqueOrThrow({
				where: { id: upserted.id },
				include: { entities: true },
			});
		});

		return mapPrismaThreatSignalToDomain(record);
	}

	async findAllPaginated(
		options: FindAllThreatSignalsPaginatedOptions,
	): Promise<DomainThreatSignal[]> {
		const records = await this.prisma.threatSignal.findMany({
			where: this.buildWhere(options),
			orderBy: { [options.sortBy]: options.sortOrder },
			skip: options.skip,
			take: options.take,
			include: { entities: true },
		});
		return records.map(mapPrismaThreatSignalToDomain);
	}

	async countAll(options: CountThreatSignalsOptions): Promise<number> {
		return this.prisma.threatSignal.count({ where: this.buildWhere(options) });
	}

	private buildWhere(
		options: CountThreatSignalsOptions,
	): Prisma.ThreatSignalWhereInput {
		const where: Prisma.ThreatSignalWhereInput = {};
		if (options.sourceKind) where.sourceKind = options.sourceKind;
		if (options.isThreat !== undefined) where.isThreat = options.isThreat;
		return where;
	}
}
