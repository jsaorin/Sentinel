import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Card, AlertBanner } from "@sentinel/ui";
import {
	MultisigHeader,
	InfoCard,
	ScoreCard,
	SignersList,
	ReportCard,
	ProposalHistory,
	MultisigNotFound,
	MultisigTabs,
	VaultsTab,
	ScoreBreakdown,
} from "@/components/multisig";
import { getMultisig, getSigners, getProposals } from "@/lib/api";
import { getRiskLevel } from "@/lib/risk";
import {
	STATUS_DISPLAY,
	WARNING_SEVERITY,
	SOLANA_ADDRESS_RE,
	SOLSCAN_BASE,
} from "@/lib/constants";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ address: string }>;
}): Promise<Metadata> {
	const { address } = await params;
	return {
		title: `Multisig ${address.slice(0, 8)}...`,
		description: `Security report for Solana multisig ${address}. Risk score, signer analysis, and proposal history.`,
	};
}

export default async function MultisigPage({
	params,
}: { params: Promise<{ address: string }> }) {
	const { address } = await params;

	try {
		const [multisig, signers, proposals] = await Promise.all([
			getMultisig(address),
			getSigners(address),
			getProposals(address),
		]);

		const latestProposal =
			proposals.length > 0
				? proposals.sort(
						(a, b) =>
							new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
					)[0]
				: null;

		const score = multisig.healthScore?.overall ?? null;

		const multisigData = {
			address: multisig.address,
			threshold: {
				current: multisig.threshold ?? 0,
				total: multisig.totalSigners,
			},
			created: new Date(multisig.createdAt).toLocaleDateString(),
			lastActivity: latestProposal
				? timeAgo(new Date(latestProposal.createdAt))
				: "No activity",
		};

		const signersData = signers.map((s) => ({
			address: s.address,
			permissions: s.permissions,
		}));

		const proposalsData = proposals.map((p) => ({
			id: `#${p.proposalIndex}`,
			linkId: p.id,
			description: p.summary ?? (
				p.instructions.length > 0
					? `${p.instructions.length} instruction${p.instructions.length > 1 ? "s" : ""}`
					: "Empty proposal"
			),
			status: STATUS_DISPLAY[p.status] ?? ("Pending" as const),
			riskLevel: p.riskScore != null ? getRiskLevel(p.riskScore) : null,
		}));

		const breakdown = multisig.healthScore?.breakdown;
		const warnings = multisig.healthScore?.warnings ?? [];
		const aiSummary = multisig.healthScore?.aiSummary ?? null;

		const overviewContent = (
			<div className="space-y-6">
				{/* Warnings */}
				{warnings.length > 0 && (
					<Card variant="default" padding="lg">
						<h3 className="text-lg font-semibold pb-4 border-b border-border-subtle">
							Warnings ({warnings.length})
						</h3>
						<div className="mt-3 space-y-3">
							{warnings.map((w, i) => (
								<AlertBanner
									key={`${w.code}-${i}`}
									level={WARNING_SEVERITY[w.code] ?? "medium"}
									title={w.code.replace(/_/g, " ")}
									description={linkifyAddresses(w.message)}
								/>
							))}
						</div>
					</Card>
				)}

				{/* Score Breakdown */}
				{breakdown && (
					<ScoreBreakdown
						breakdown={breakdown}
						calculatedAt={multisig.healthScore?.calculatedAt}
					/>
				)}

				<ReportCard title="AI Security Summary" content={aiSummary} />
			</div>
		);

		const signersContent = (
			<SignersList signers={signersData} />
		);

		const proposalsContent = (
			<ProposalHistory proposals={proposalsData} />
		);

		const tabs = [
			{ id: "overview", label: "Overview", content: overviewContent },
			{ id: "signers", label: `Signers (${signers.length})`, shortLabel: "Signers", content: signersContent },
			{ id: "proposals", label: `Proposals (${proposals.length})`, shortLabel: "Proposals", content: proposalsContent },
		];

		if (multisig.vaults.length > 0) {
			tabs.push({
				id: "vaults",
				label: `Vaults (${multisig.vaults.length})`,
				shortLabel: "Vaults",
				content: <VaultsTab vaults={multisig.vaults} />,
			});
		}

		return (
			<main className="min-h-screen pb-16">
				<MultisigHeader />

				<div className="max-w-6xl mx-auto px-6 space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="md:col-span-2">
							<InfoCard
								address={multisigData.address}
								type="Squads v4"
								threshold={multisigData.threshold}
								created={multisigData.created}
								lastActivity={multisigData.lastActivity}
								score={score}
								configAuthority={multisig.configAuthority}
							/>
						</div>
						<ScoreCard score={score ?? 0} />
					</div>

					<MultisigTabs tabs={tabs} />
				</div>
			</main>
		);
	} catch (err) {
		console.error("[MultisigPage] Error fetching data:", err);
		return (
			<main className="min-h-screen pb-16">
				<MultisigHeader />
				<MultisigNotFound address={address} />
			</main>
		);
	}
}

function timeAgo(date: Date): string {
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMin = Math.floor(diffMs / 60000);
	if (diffMin < 1) return "just now";
	if (diffMin < 60) return `${diffMin} min ago`;
	const diffHr = Math.floor(diffMin / 60);
	if (diffHr < 24) return `${diffHr} hr ago`;
	const diffDays = Math.floor(diffHr / 24);
	return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

function linkifyAddresses(text: string): ReactNode {
	const segments = text.split(SOLANA_ADDRESS_RE);
	const addresses = text.match(SOLANA_ADDRESS_RE);

	if (!addresses || addresses.length === 0) return text;

	const parts: ReactNode[] = [];
	for (let i = 0; i < segments.length; i++) {
		if (segments[i]) parts.push(segments[i]);
		if (i < addresses.length) {
			const addr = addresses[i];
			parts.push(
				<a
					key={i}
					href={`${SOLSCAN_BASE}/${addr}`}
					target="_blank"
					rel="noopener noreferrer"
					className="font-mono text-text-link hover:text-primary transition-colors"
				>
					{addr.slice(0, 4)}...{addr.slice(-4)}
				</a>,
			);
		}
	}

	return <>{parts}</>;
}
