import type { Metadata } from "next";
import { Card, Badge, AlertBanner } from "@sentinel/ui";
import { MultisigHeader } from "@/components/multisig";
import { getThreatSignalById } from "@/lib/api";
import { notFound } from "next/navigation";
import {
	SEVERITY_LABEL,
	SEVERITY_VARIANT,
	CATEGORY_LABEL,
	SOURCE_KIND_LABEL,
} from "@/lib/constants";

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

function SeverityBanner({
	severity,
}: {
	severity: "low" | "medium" | "high";
}) {
	const levelMap = { low: "low", medium: "medium", high: "high" } as const;
	const titleMap = {
		low: "Low Severity Threat",
		medium: "Medium Severity Threat",
		high: "High Severity Threat",
	};
	return (
		<AlertBanner
			level={levelMap[severity]}
			title={titleMap[severity]}
		/>
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

	const severityVariant = signal.severity
		? SEVERITY_VARIANT[signal.severity]
		: undefined;

	return (
		<main className="min-h-screen pb-16">
			<MultisigHeader />

			<div className="max-w-6xl mx-auto px-6 space-y-6">
				{/* Header card */}
				<Card variant="default" padding="lg">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
						<h3 className="text-md sm:text-lg font-semibold">
							Threat Signal
						</h3>
						<div className="flex items-center gap-3">
							{signal.category && (
								<Badge variant="unknown">
									{CATEGORY_LABEL[signal.category] ?? signal.category}
								</Badge>
							)}
							{severityVariant && (
								<Badge variant={severityVariant}>
									{SEVERITY_LABEL[signal.severity!] ?? signal.severity}
								</Badge>
							)}
							<Badge variant="info">
								{SOURCE_KIND_LABEL[signal.sourceKind] ?? signal.sourceKind}
							</Badge>
						</div>
					</div>
					<div className="mt-1">
						<InfoRow
							label="Source"
							value={signal.sourceLabel ?? SOURCE_KIND_LABEL[signal.sourceKind] ?? signal.sourceKind}
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
						{signal.sourceUrl && (
							<div className="flex items-center justify-between py-2.5 border-b border-border-subtle last:border-b-0">
								<span className="text-text-tertiary text-xs uppercase tracking-wider font-semibold">
									Source URL
								</span>
								<a
									href={signal.sourceUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="text-sm text-text-link hover:text-primary transition-colors font-mono"
								>
									Open in source &rarr;
								</a>
							</div>
						)}
					</div>
				</Card>

				{/* Severity banner */}
				{signal.severity && (
					<SeverityBanner severity={signal.severity} />
				)}

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
							<InfoRow
								label="Severity"
								value={SEVERITY_LABEL[signal.severity] ?? signal.severity}
							/>
						)}
					</div>
				</Card>
			</div>
		</main>
	);
}
