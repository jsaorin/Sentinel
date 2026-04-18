import type { Metadata } from "next";
import { Card, RiskBadge, Badge } from "@sentinel/ui";
import { MultisigHeader, ReportCard } from "@/components/multisig";
import { ScoreCard } from "@/components/multisig/ScoreCard";
import { MOCK_PROPOSAL_DETAILS } from "@/lib/mock-data";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>;
}): Promise<Metadata> {
	const { id } = await params;
	return {
		title: `Proposal #${id}`,
		description: `Security analysis for Proposal #${id}. AI risk score, signer verification, and transaction action review.`,
	};
}

function getStatusVariant(status: string) {
	if (status === "Executed") return "safe" as const;
	if (status === "Rejected") return "critical" as const;
	return "medium" as const;
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
		<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 py-3 border-b border-border-subtle last:border-b-0">
			<span className="text-text-tertiary text-sm uppercase tracking-wider font-semibold shrink-0">
				{label}
			</span>
			<span
				className={`text-text-primary text-md text-left sm:text-right ${mono ? "font-mono" : ""}`}
			>
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
	const proposal = MOCK_PROPOSAL_DETAILS[id] ?? MOCK_PROPOSAL_DETAILS["1247"];

	return (
		<main className="min-h-screen pb-16">
			<MultisigHeader />

			<div className="max-w-6xl mx-auto px-6 space-y-6">
				{/* Header row */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="md:col-span-2">
						<Card variant="default" padding="lg">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
								<h3 className="text-lg font-semibold">
									<span className="font-mono">{proposal.id}</span> Proposal
								</h3>
								<div className="flex items-center gap-3">
									<Badge variant={getStatusVariant(proposal.status)}>
										{proposal.status}
									</Badge>
									<RiskBadge level={proposal.riskLevel} size="sm" />
								</div>
							</div>
							<div className="mt-1">
								<InfoRow label="Description" value={proposal.description} />
								<InfoRow label="Multisig" value={proposal.multisig} />
								<InfoRow
									label="Address"
									value={`${proposal.multisigAddress.slice(0, 8)}...${proposal.multisigAddress.slice(-4)}`}
									mono
								/>
								<InfoRow label="Created" value={proposal.created} />
								<InfoRow
									label="Executed"
									value={proposal.executed ?? "Pending"}
								/>
							</div>
						</Card>
					</div>

					<ScoreCard score={proposal.score} />
				</div>

				{/* Signers */}
				<Card variant="default" padding="lg">
					<h3 className="text-lg font-semibold pb-4 border-b border-border-subtle">
						Signers ({proposal.signers.length})
					</h3>
					<div className="mt-1">
						{proposal.signers.map((signer, i) => (
							<div
								key={signer.address}
								className={[
									"flex items-center justify-between py-4 px-2 hover:bg-bg-hover transition-colors",
									i < proposal.signers.length - 1
										? "border-b border-border-subtle"
										: "",
								].join(" ")}
							>
								<div className="flex items-center gap-4 min-w-0">
									<span className="font-mono text-md text-text-primary">
										{signer.address}
									</span>
									<span className="text-md text-text-secondary hidden sm:block">
										{signer.label}
									</span>
								</div>
								<Badge
									className={`w-24 justify-start text-xs font-semibold tracking-wider uppercase ${signer.signed ? "text-text-primary" : "text-text-secondary"}`}
								>
									{signer.signed ? "Signed" : "Pending"}
								</Badge>
							</div>
						))}
					</div>
				</Card>

				{/* Transaction Actions */}
				<Card variant="default" padding="lg">
					<h3 className="text-lg font-semibold pb-4 border-b border-border-subtle">
						Transaction Actions
					</h3>
					<div className="mt-1">
						{proposal.actions.map((action, i) => (
							<div
								key={action}
								className={[
									"py-3 px-2",
									i < proposal.actions.length - 1
										? "border-b border-border-subtle"
										: "",
								].join(" ")}
							>
								<span className="font-mono text-sm text-text-secondary">
									{action}
								</span>
							</div>
						))}
					</div>
				</Card>

				<ReportCard />
			</div>
		</main>
	);
}
