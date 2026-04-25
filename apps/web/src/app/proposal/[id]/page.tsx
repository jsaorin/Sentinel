import type { Metadata } from "next";
import { Card, RiskBadge, Badge, AlertBanner } from "@sentinel/ui";
import {
	MultisigHeader,
	ReportCard,
	MultisigTabs,
} from "@/components/multisig";
import { ScoreCard } from "@/components/multisig/ScoreCard";
import { SignerRow } from "@/components/multisig/SignerRow";
import { getProposalDetail } from "@/lib/api";
import { getRiskLevel } from "@/lib/risk";
import { notFound } from "next/navigation";
import {
	STATUS_VARIANT,
	STATUS_LABEL,
	FLAG_SEVERITY_LEVEL,
	RECOMMENDATION_VARIANT,
	RECOMMENDATION_LABEL,
	SOLSCAN_BASE,
} from "@/lib/constants";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>;
}): Promise<Metadata> {
	const { id } = await params;
	return {
		title: `Proposal ${id.slice(0, 8)}...`,
		description:
			"Security analysis for proposal. AI risk score, signer verification, and transaction action review.",
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

export default async function ProposalPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	let proposal: Awaited<ReturnType<typeof getProposalDetail>>;
	try {
		proposal = await getProposalDetail(id);
	} catch {
		notFound();
	}

	const riskScore = proposal.scoring?.riskScore ?? null;
	const riskLevel = riskScore != null ? getRiskLevel(riskScore) : "unknown";
	const flags = proposal.scoring?.flags ?? [];
	const summary = proposal.scoring?.summary ?? null;

	/* ── Overview tab ──────────────────────────────────────── */
	const overviewContent = (
		<div className="space-y-6">
			{/* Risk Flags — hard data first */}
			{flags.length > 0 && (
				<Card variant="default" padding="lg">
					<h3 className="text-lg font-semibold pb-4 border-b border-border-subtle">
						Risk Flags ({flags.length})
					</h3>
					<div className="mt-1">
						{flags.map((flag, i) => (
							<div
								key={flag.type}
								className={[
									"flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-4 px-2",
									i < flags.length - 1 ? "border-b border-border-subtle" : "",
								].join(" ")}
							>
								<div className="flex items-center gap-3 min-w-0">
									<Badge
										variant={FLAG_SEVERITY_LEVEL[flag.severity] ?? "medium"}
									>
										{flag.severity}
									</Badge>
									<span className="text-md text-text-primary">
										{flag.detail}
									</span>
								</div>
								<span className="font-mono text-sm text-text-tertiary shrink-0">
									+{flag.points} pts
								</span>
							</div>
						))}
					</div>
				</Card>
			)}

			{/* AI Analysis — explanation */}
			<ReportCard title="AI Analysis" content={proposal.ai?.analysis ?? null} />

			{/* AI Recommendation — verdict last */}
			{proposal.ai && (
				<Card variant="default" padding="lg">
					<h3 className="text-lg font-semibold pb-4 border-b border-border-subtle">
						AI Recommendation
					</h3>
					<div className="mt-3">
						<AlertBanner
							level={
								RECOMMENDATION_VARIANT[proposal.ai.recommendation] ?? "medium"
							}
							title={
								RECOMMENDATION_LABEL[proposal.ai.recommendation] ??
								proposal.ai.recommendation
							}
						/>
					</div>
				</Card>
			)}
		</div>
	);

	/* ── Signers tab ───────────────────────────────────────── */
	const signersContent = (
		<Card variant="default" padding="lg">
			<h3 className="text-lg font-semibold pb-4 border-b border-border-subtle">
				Signers ({proposal.signers.length})
			</h3>
			<div className="mt-1">
				{proposal.signers.map((signer, i) => (
					<SignerRow
						key={signer.address}
						address={signer.address}
						permissions={signer.permissions}
						isLast={i === proposal.signers.length - 1}
					/>
				))}
			</div>
		</Card>
	);

	/* ── Instructions tab ──────────────────────────────────── */
	const instructionsContent = (
		<Card variant="default" padding="lg">
			<h3 className="text-lg font-semibold pb-4 border-b border-border-subtle">
				Instructions ({proposal.instructions.length})
			</h3>
			<div className="mt-4 space-y-4">
				{proposal.instructions.map((ix) => (
					<div
						key={ix.instructionIndex}
						className="border border-border-subtle rounded-md p-4"
					>
						<div className="flex items-center justify-between mb-3">
							<div className="flex items-center gap-2">
								<span className="font-mono text-sm text-text-tertiary">
									#{ix.instructionIndex}
								</span>
								<span className="text-md font-semibold text-text-primary">
									{ix.programName}
								</span>
								<span className="text-md text-text-secondary">
									:: {ix.action}
								</span>
							</div>
							{!ix.isKnown && <Badge variant="unknown">Unknown</Badge>}
						</div>

						{/* Params */}
						{Object.keys(ix.params).length > 0 && (
							<div className="mb-3">
								<span className="text-xs uppercase tracking-wider font-semibold text-text-tertiary">
									Parameters
								</span>
								<div className="mt-1 space-y-1">
									{Object.entries(ix.params).map(([key, val]) => (
										<div key={key} className="flex items-center gap-2">
											<span className="text-sm text-text-secondary">
												{key}:
											</span>
											<span className="font-mono text-sm text-text-primary">
												{val}
											</span>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Accounts */}
						{ix.accounts.length > 0 && (
							<div>
								<span className="text-xs uppercase tracking-wider font-semibold text-text-tertiary">
									Accounts
								</span>
								<div className="mt-1 space-y-1">
									{ix.accounts.map((acc) => (
										<div
											key={`${acc.label}-${acc.address}`}
											className="flex items-center gap-2"
										>
											<span className="text-sm text-text-secondary">
												{acc.label}:
											</span>
											<a
												href={`${SOLSCAN_BASE}/${acc.address}`}
												target="_blank"
												rel="noopener noreferrer"
												className="font-mono text-sm text-text-link hover:text-primary transition-colors"
											>
												{acc.address.slice(0, 4)}...{acc.address.slice(-4)}
											</a>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				))}
			</div>
		</Card>
	);

	/* ── Tabs ──────────────────────────────────────────────── */
	const tabs = [
		{ id: "overview", label: "Overview", content: overviewContent },
		{
			id: "signers",
			label: `Signers (${proposal.signers.length})`,
			shortLabel: "Signers",
			content: signersContent,
		},
		{
			id: "instructions",
			label: `Instructions (${proposal.instructions.length})`,
			shortLabel: "Instructions",
			content: instructionsContent,
		},
	];

	return (
		<main className="min-h-screen pb-16">
			<MultisigHeader />

			<div className="max-w-6xl mx-auto px-6 space-y-6">
				{/* Header: Info card + Score gauge */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="md:col-span-2">
						<Card variant="default" padding="lg">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
								<h3 className="text-md sm:text-lg font-semibold">
									<span className="font-mono">#{proposal.proposalIndex}</span>{" "}
									Proposal
								</h3>
								<div className="flex items-center gap-3">
									<Badge variant={STATUS_VARIANT[proposal.status] ?? "medium"}>
										{STATUS_LABEL[proposal.status] ?? proposal.status}
									</Badge>
									<RiskBadge level={riskLevel} size="sm" />
								</div>
							</div>
							<div className="mt-1">
								{summary && <InfoRow label="Summary" value={summary} />}
								<InfoRow
									label="Multisig"
									value={proposal.multisig.label ?? proposal.multisig.address}
								/>
								<InfoRow
									label="Threshold"
									value={`${proposal.multisig.threshold ?? "?"} of ${proposal.multisig.totalSigners}`}
								/>
								{proposal.creator && (
									<InfoRow
										label="Creator"
										value={`${proposal.creator.slice(0, 4)}...${proposal.creator.slice(-4)}`}
										mono
									/>
								)}
								<InfoRow
									label="Created"
									value={new Date(proposal.createdAt).toLocaleString()}
								/>
								<InfoRow
									label="Executed"
									value={
										proposal.executedAt
											? new Date(proposal.executedAt).toLocaleString()
											: "Pending"
									}
								/>
							</div>
						</Card>
					</div>

					<ScoreCard score={riskScore ?? 0} />
				</div>

				{/* Tabbed content */}
				<MultisigTabs tabs={tabs} />
			</div>
		</main>
	);
}
