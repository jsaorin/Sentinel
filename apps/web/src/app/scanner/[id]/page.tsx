import { MultisigHeader } from "@/components/multisig";
import { getThreatSignalById } from "@/lib/api";
import {
	CATEGORY_LABEL,
	ENTITY_KIND_LABEL,
	ENTITY_ROLE_LABEL,
	ENTITY_ROLE_VARIANT,
	SOLSCAN_BASE,
	SOURCE_KIND_LABEL,
} from "@/lib/constants";
import { Badge, Card, RiskBadge } from "@sentinel/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>;
}): Promise<Metadata> {
	const { id } = await params;
	return {
		title: `Threat Signal ${id.slice(0, 8)}...`,
		description:
			"Threat signal detail. AI-analyzed security intelligence for Solana.",
	};
}

function InfoRow({
	label,
	value,
	mono = false,
}: {
	label: string;
	value: string;
	mono?: boolean;
}) {
	return (
		<div className="flex items-center justify-between py-2.5 border-b border-border-subtle last:border-b-0">
			<span className="text-text-tertiary text-xs uppercase tracking-wider font-semibold">
				{label}
			</span>
			<span className={`text-text-primary text-sm ${mono ? "font-mono" : ""}`}>
				{value}
			</span>
		</div>
	);
}

export default async function ThreatSignalPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	let signal: Awaited<ReturnType<typeof getThreatSignalById>>;
	try {
		signal = await getThreatSignalById(id);
	} catch {
		notFound();
	}

	if (!signal) {
		notFound();
	}

	return (
		<main className="min-h-screen pb-16">
			<MultisigHeader />

			<div className="max-w-6xl mx-auto px-6 space-y-6">
				{/* Header card */}
				<Card variant="default" padding="lg">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
						<h3 className="text-md sm:text-lg font-semibold">Threat Signal</h3>
						<div className="flex flex-wrap items-center gap-3">
							{signal.category && (
								<Badge variant="unknown">
									{CATEGORY_LABEL[signal.category] ?? signal.category}
								</Badge>
							)}
							<RiskBadge level={signal.severity ?? "unknown"} size="sm" />
							<Badge variant="info">
								{SOURCE_KIND_LABEL[signal.sourceKind] ?? signal.sourceKind}
							</Badge>
						</div>
					</div>
					<div className="mt-1">
						<InfoRow
							label="Source"
							value={
								signal.sourceLabel ??
								SOURCE_KIND_LABEL[signal.sourceKind] ??
								signal.sourceKind
							}
						/>
						<InfoRow
							label="Captured"
							value={new Date(signal.capturedAt).toLocaleString()}
						/>
						<InfoRow
							label="Analyzed"
							value={
								signal.analyzedAt
									? new Date(signal.analyzedAt).toLocaleString()
									: "Pending"
							}
						/>
						<InfoRow
							label="Threat Detected"
							value={
								signal.isThreat == null
									? "Pending"
									: signal.isThreat
										? "Yes"
										: "No"
							}
						/>
					</div>
				</Card>

				{/* AI Summary */}
				<Card variant="default" padding="lg">
					<h3 className="text-lg font-semibold pb-4 border-b border-border-subtle">
						AI Summary
					</h3>
					<div className="mt-4">
						{signal.summary ? (
							<p className="text-md text-text-secondary leading-relaxed">
								{signal.summary}
							</p>
						) : (
							<p className="text-sm text-text-tertiary">
								Analysis not yet available.
							</p>
						)}
					</div>
				</Card>

				{/* Affected Entities */}
				{signal.entities.length > 0 && (
					<Card variant="default" padding="lg">
						<h3 className="text-lg font-semibold pb-4 border-b border-border-subtle">
							Affected Entities ({signal.entities.length})
						</h3>

						{/* Table header */}
						<div className="hidden md:flex items-center py-3 px-2 text-xs uppercase tracking-wider font-semibold text-text-tertiary border-b border-border-subtle">
							<span className="w-28">Type</span>
							<span className="w-28">Role</span>
							<span className="w-40">Address</span>
							<span className="flex-1 min-w-0">Description</span>
						</div>

						{/* Rows */}
						{signal.entities.map((entity, i) => (
							<div
								key={`${entity.kind}-${entity.address}`}
								className={[
									"flex flex-col md:flex-row md:items-center gap-3 md:gap-0 py-4 md:px-2",
									i < signal.entities.length - 1
										? "border-b border-border-subtle"
										: "",
								].join(" ")}
							>
								{/* Mobile layout */}
								<div className="flex flex-col gap-2 md:hidden">
									<div className="flex items-center gap-3">
										<Badge variant="info" className="!px-0">
											{ENTITY_KIND_LABEL[entity.kind] ?? entity.kind}
										</Badge>
										{entity.role && (
											<Badge
												variant={ENTITY_ROLE_VARIANT[entity.role] ?? "unknown"}
												className="!px-0"
											>
												{ENTITY_ROLE_LABEL[entity.role] ?? entity.role}
											</Badge>
										)}
									</div>
									<a
										href={`${SOLSCAN_BASE}/${entity.address}`}
										target="_blank"
										rel="noopener noreferrer"
										className="font-mono text-sm text-text-link hover:text-primary transition-colors"
									>
										{entity.address.slice(0, 4)}...{entity.address.slice(-4)}
									</a>
									{entity.contextSnippet && (
										<p className="text-sm text-text-secondary">
											{entity.contextSnippet}
										</p>
									)}
								</div>

								{/* Desktop layout */}
								<span className="w-28 hidden md:flex">
									<Badge variant="info">
										{ENTITY_KIND_LABEL[entity.kind] ?? entity.kind}
									</Badge>
								</span>
								<span className="w-28 hidden md:flex">
									{entity.role ? (
										<Badge
											variant={ENTITY_ROLE_VARIANT[entity.role] ?? "unknown"}
										>
											{ENTITY_ROLE_LABEL[entity.role] ?? entity.role}
										</Badge>
									) : (
										<span className="text-xs text-text-tertiary">—</span>
									)}
								</span>
								<span className="w-40 hidden md:block">
									<a
										href={`${SOLSCAN_BASE}/${entity.address}`}
										target="_blank"
										rel="noopener noreferrer"
										className="font-mono text-sm text-text-link hover:text-primary transition-colors"
									>
										{entity.address.slice(0, 6)}...
										{entity.address.slice(-6)}
									</a>
								</span>
								<span className="flex-1 min-w-0 text-sm text-text-secondary hidden md:block">
									{entity.contextSnippet ?? "—"}
								</span>
							</div>
						))}
					</Card>
				)}

				{/* Signal ID (for reference) */}
				<Card variant="default" padding="lg">
					<h3 className="text-lg font-semibold pb-4 border-b border-border-subtle">
						Signal Details
					</h3>
					<div className="mt-1">
						<InfoRow label="Signal ID" value={signal.id} mono />
						<InfoRow
							label="Source Kind"
							value={SOURCE_KIND_LABEL[signal.sourceKind] ?? signal.sourceKind}
						/>
						{signal.category && (
							<InfoRow
								label="Category"
								value={CATEGORY_LABEL[signal.category] ?? signal.category}
							/>
						)}
						{signal.severity && (
							<div className="flex items-center justify-between py-2.5 border-b border-border-subtle last:border-b-0">
								<span className="text-text-tertiary text-xs uppercase tracking-wider font-semibold">
									Severity
								</span>
								<RiskBadge level={signal.severity} size="sm" />
							</div>
						)}
					</div>
				</Card>
			</div>
		</main>
	);
}
