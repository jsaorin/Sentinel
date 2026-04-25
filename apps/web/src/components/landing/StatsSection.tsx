import { ProposalIcon, WalletIcon } from "@/components/icons";
import { StatsListCard } from "./StatsListCard";
import { StatsListRow } from "./StatsListRow";
import { getMultisigList, getProposals } from "@/lib/api";
import { getLevel, getRiskLevel } from "@/lib/risk";
import type { RiskLevel } from "@/lib/risk";

function timeAgo(iso: string): string {
	const now = new Date();
	const date = new Date(iso);
	const diffMs = now.getTime() - date.getTime();
	const diffMin = Math.floor(diffMs / 60000);
	if (diffMin < 1) return "just now";
	if (diffMin < 60) return `${diffMin} min ago`;
	const diffHr = Math.floor(diffMin / 60);
	if (diffHr < 24) return `${diffHr} hr ago`;
	const diffDays = Math.floor(diffHr / 24);
	return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

export async function StatsSection() {
	let multisigs: Awaited<ReturnType<typeof getMultisigList>> = [];
	try {
		multisigs = await getMultisigList();
	} catch {
		/* API unavailable — render empty */
	}

	// Latest wallets: sort by createdAt desc, take 6
	const wallets = [...multisigs]
		.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		)
		.slice(0, 6);

	// Latest proposals: fetch from the first few multisigs with recent activity
	const multisigsWithActivity = multisigs
		.filter((m) => m.lastActivity)
		.sort(
			(a, b) =>
				new Date(b.lastActivity!).getTime() -
				new Date(a.lastActivity!).getTime(),
		)
		.slice(0, 4);

	type LandingProposal = {
		id: string;
		linkId: string;
		timeAgo: string;
		multisig: string;
		riskLevel: RiskLevel;
	};

	let proposals: LandingProposal[] = [];
	try {
		const results = await Promise.all(
			multisigsWithActivity.map(async (m) => {
				const { proposals: props } = await getProposals(m.address, 1, 6);
				return props.map((p) => ({
					id: `#${p.proposalIndex}`,
					linkId: p.id,
					timeAgo: timeAgo(p.createdAt),
					multisig:
						m.label ?? `${m.address.slice(0, 4)}..${m.address.slice(-4)}`,
					riskLevel: (p.riskScore != null
						? getRiskLevel(p.riskScore)
						: "unknown") as RiskLevel,
					_createdAt: p.createdAt,
				}));
			}),
		);
		proposals = results
			.flat()
			.sort(
				(a, b) =>
					new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime(),
			)
			.slice(0, 6);
	} catch {
		/* API unavailable */
	}

	return (
		<section className="max-w-6xl mx-auto px-6 pb-10">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<StatsListCard
					title="Latest Proposals"
					viewAllLabel="View All Proposals"
					viewAllHref="/proposals"
				>
					{proposals.length === 0 ? (
						<p className="py-8 text-center text-text-tertiary text-sm">
							No proposals yet
						</p>
					) : (
						proposals.map((p, i) => (
							<StatsListRow
								key={`${p.linkId}`}
								icon={<ProposalIcon className="w-4 h-4" />}
								primaryText={`Proposal ${p.id}`}
								secondaryText={p.timeAgo}
								metadata={p.multisig}
								riskLevel={p.riskLevel}
								isLast={i === proposals.length - 1}
								href={`/proposal/${p.linkId}`}
							/>
						))
					)}
				</StatsListCard>

				<StatsListCard
					title="Latest Wallets Analyzed"
					viewAllLabel="View All Wallets"
					viewAllHref="/multisigs"
				>
					{wallets.length === 0 ? (
						<p className="py-8 text-center text-text-tertiary text-sm">
							No wallets yet
						</p>
					) : (
						wallets.map((w, i) => (
							<StatsListRow
								key={w.id}
								icon={<WalletIcon className="w-4 h-4" />}
								primaryText={`${w.address.slice(0, 4)}..${w.address.slice(-4)}`}
								secondaryText={timeAgo(w.createdAt)}
								metadata={
									w.threshold != null
										? `Squads ${w.threshold}/${w.totalSigners}`
										: "Squads"
								}
								riskLevel={
									w.healthScore != null ? getLevel(w.healthScore) : "unknown"
								}
								isLast={i === wallets.length - 1}
								href={`/multisig/${w.address}`}
							/>
						))
					)}
				</StatsListCard>
			</div>
		</section>
	);
}
