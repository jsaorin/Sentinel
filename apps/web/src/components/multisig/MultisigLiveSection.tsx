"use client";

import { useRealtimeRoom } from "@/hooks/useRealtimeRoom";
import { type MultisigResponse, getMultisig } from "@/lib/api";
import {
	SOLANA_ADDRESS_RE,
	SOLSCAN_BASE,
	WARNING_SEVERITY,
} from "@/lib/constants";
import { REALTIME_ACTIONS, REALTIME_ROOMS } from "@sentinel/common/realtime";
import { AlertBanner, Card } from "@sentinel/ui";
import { type ReactNode, useCallback, useState } from "react";
import { InfoCard } from "./InfoCard";
import { MultisigTabs } from "./MultisigTabs";
import { ReportCard } from "./ReportCard";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { ScoreCard } from "./ScoreCard";

type Tab = {
	id: string;
	label: string;
	shortLabel?: string;
	content: ReactNode;
};

type MultisigLiveSectionProps = {
	address: string;
	initialMultisig: MultisigResponse;
	created: string;
	lastActivity: string;
	signersTab: Tab;
	proposalsTab: Tab;
	vaultsTab?: Tab;
};

export function MultisigLiveSection({
	address,
	initialMultisig,
	created,
	lastActivity,
	signersTab,
	proposalsTab,
	vaultsTab,
}: MultisigLiveSectionProps) {
	const [multisig, setMultisig] = useState<MultisigResponse>(initialMultisig);

	const refetch = useCallback(async () => {
		try {
			const fresh = await getMultisig(address);
			setMultisig(fresh);
		} catch (err) {
			console.error("[MultisigLiveSection] refetch failed:", err);
		}
	}, [address]);

	useRealtimeRoom(
		REALTIME_ROOMS.multisig(multisig.id),
		REALTIME_ACTIONS.NEW_ANALYSIS_MULTISIG,
		refetch,
	);

	const score = multisig.healthScore?.overall ?? null;
	const breakdown = multisig.healthScore?.breakdown;
	const warnings = [...(multisig.healthScore?.warnings ?? [])].sort(
		(a, b) =>
			new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime(),
	);
	const aiSummary = multisig.healthScore?.aiSummary ?? null;

	const overviewContent = (
		<div className="space-y-6">
			{breakdown && (
				<ScoreBreakdown
					breakdown={breakdown}
					calculatedAt={multisig.healthScore?.calculatedAt}
				/>
			)}

			<ReportCard title="AI Security Summary" content={aiSummary} />

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
		</div>
	);

	const tabs: Tab[] = [
		{ id: "overview", label: "Overview", content: overviewContent },
		signersTab,
		proposalsTab,
		...(vaultsTab ? [vaultsTab] : []),
	];

	return (
		<div className="max-w-6xl mx-auto px-6 space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="md:col-span-2">
					<InfoCard
						address={multisig.address}
						type="Squads v4"
						threshold={{
							current: multisig.threshold ?? 0,
							total: multisig.totalSigners,
						}}
						created={created}
						lastActivity={lastActivity}
						score={score}
						configAuthority={multisig.configAuthority}
					/>
				</div>
				<ScoreCard score={score ?? 0} />
			</div>

			<MultisigTabs tabs={tabs} />
		</div>
	);
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
					key={`${addr}-${i}`}
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
