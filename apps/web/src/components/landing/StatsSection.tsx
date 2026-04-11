import { ProposalIcon, WalletIcon } from "@/components/icons";
import { StatsListCard } from "./StatsListCard";
import { StatsListRow } from "./StatsListRow";
import {
	MOCK_LANDING_PROPOSALS,
	MOCK_LANDING_WALLETS,
} from "@/lib/mock-data";

export function StatsSection() {
	return (
		<section className="max-w-6xl mx-auto px-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<StatsListCard
					title="Latest Proposals"
					viewAllLabel="View All Proposals"
					viewAllHref="/proposals"
				>
					{MOCK_LANDING_PROPOSALS.map((p, i) => (
						<StatsListRow
							key={p.id}
							icon={<ProposalIcon className="w-4 h-4" />}
							primaryText={`Proposal ${p.id}`}
							secondaryText={p.timeAgo}
							metadata={p.multisig}
							riskLevel={p.riskLevel}
							isLast={i === MOCK_LANDING_PROPOSALS.length - 1}
							href={`/proposal/${p.id.replace("#", "")}`}
						/>
					))}
				</StatsListCard>

				<StatsListCard
					title="Latest Wallets Analyzed"
					viewAllLabel="View All Wallets"
					viewAllHref="/wallets"
				>
					{MOCK_LANDING_WALLETS.map((w, i) => (
						<StatsListRow
							key={w.address}
							icon={<WalletIcon className="w-4 h-4" />}
							primaryText={w.address}
							secondaryText={w.timeAgo}
							metadata={w.label}
							riskLevel={w.riskLevel}
							isLast={i === MOCK_LANDING_WALLETS.length - 1}
							href={`/multisig/${w.address}`}
						/>
					))}
				</StatsListCard>
			</div>
		</section>
	);
}
