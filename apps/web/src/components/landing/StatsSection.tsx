import { ProposalIcon, WalletIcon } from "@/components/icons";
import { StatsListCard } from "./StatsListCard";
import { StatsListRow } from "./StatsListRow";

type RiskLevel = "critical" | "high" | "medium" | "low" | "safe";

const MOCK_PROPOSALS: Array<{
	id: string;
	timeAgo: string;
	multisig: string;
	riskLevel: RiskLevel;
}> = [
	{ id: "#1247", timeAgo: "2 min ago", multisig: "Drift Protocol", riskLevel: "low" },
	{ id: "#1246", timeAgo: "8 min ago", multisig: "Marinade Finance", riskLevel: "critical" },
	{ id: "#1245", timeAgo: "15 min ago", multisig: "Jupiter Exchange", riskLevel: "medium" },
	{ id: "#1244", timeAgo: "23 min ago", multisig: "Tensor NFT", riskLevel: "safe" },
	{ id: "#1243", timeAgo: "31 min ago", multisig: "Raydium", riskLevel: "high" },
	{ id: "#1242", timeAgo: "45 min ago", multisig: "Orca", riskLevel: "low" },
];

const MOCK_WALLETS: Array<{
	address: string;
	timeAgo: string;
	label: string;
	riskLevel: RiskLevel;
}> = [
	{ address: "7xK9..aB3q", timeAgo: "1 min ago", label: "Squads 3/5", riskLevel: "safe" },
	{ address: "3mQ7..zF1w", timeAgo: "5 min ago", label: "Squads 2/3", riskLevel: "medium" },
	{ address: "9pR2..wK8e", timeAgo: "12 min ago", label: "Squads 4/7", riskLevel: "safe" },
	{ address: "5nL4..hG6y", timeAgo: "18 min ago", label: "Squads 2/5", riskLevel: "critical" },
	{ address: "2jM8..cD0r", timeAgo: "27 min ago", label: "Squads 3/5", riskLevel: "low" },
	{ address: "8tV6..pN2x", timeAgo: "34 min ago", label: "Squads 5/9", riskLevel: "safe" },
];

export function StatsSection() {
	return (
		<section className="max-w-6xl mx-auto px-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<StatsListCard
					title="Latest Proposals"
					viewAllLabel="View All Proposals"
					viewAllHref="/proposals"
				>
					{MOCK_PROPOSALS.map((p, i) => (
						<StatsListRow
							key={p.id}
							icon={<ProposalIcon className="w-4 h-4" />}
							primaryText={`Proposal ${p.id}`}
							secondaryText={p.timeAgo}
							metadata={p.multisig}
							riskLevel={p.riskLevel}
							isLast={i === MOCK_PROPOSALS.length - 1}
						/>
					))}
				</StatsListCard>

				<StatsListCard
					title="Latest Wallets Analyzed"
					viewAllLabel="View All Wallets"
					viewAllHref="/wallets"
				>
					{MOCK_WALLETS.map((w, i) => (
						<StatsListRow
							key={w.address}
							icon={<WalletIcon className="w-4 h-4" />}
							primaryText={w.address}
							secondaryText={w.timeAgo}
							metadata={w.label}
							riskLevel={w.riskLevel}
							isLast={i === MOCK_WALLETS.length - 1}
						/>
					))}
				</StatsListCard>
			</div>
		</section>
	);
}
