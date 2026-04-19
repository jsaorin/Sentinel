import { Card, RiskBadge } from "@sentinel/ui";
import { getLevel, LEVEL_HEX } from "@/lib/risk";

type InfoCardProps = {
	address: string;
	type: string;
	threshold: { current: number; total: number };
	created: string;
	lastActivity: string;
	score?: number | null;
	configAuthority?: string | null;
};

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

export function InfoCard({
	address,
	type,
	threshold,
	created,
	lastActivity,
	score,
	configAuthority,
}: InfoCardProps) {
	const truncated = `${address.slice(0, 4)}...${address.slice(-4)}`;

	return (
		<Card variant="default" padding="lg">
			<div className="flex items-center justify-between pb-3 border-b border-border-subtle">
				<h3 className="text-md sm:text-lg font-semibold">Multisig Info</h3>
				{score != null && (
					<span
						className="flex items-center gap-1"
						style={{ color: LEVEL_HEX[getLevel(score)] }}
					>
						<RiskBadge level={getLevel(score)} size="sm" />
						<span className="text-xs font-semibold tracking-wider">RISK</span>
					</span>
				)}
			</div>
			<div className="mt-1">
				<InfoRow label="Address" value={truncated} mono />
				<InfoRow label="Type" value={type} />
				<InfoRow
					label="Threshold"
					value={`${threshold.current} of ${threshold.total}`}
				/>
				<InfoRow label="Created" value={created} mono />
				<InfoRow label="Last Activity" value={lastActivity} />
				{configAuthority && (
					<InfoRow label="Config Authority" value={`${configAuthority.slice(0, 8)}...${configAuthority.slice(-4)}`} mono />
				)}
			</div>
		</Card>
	);
}
