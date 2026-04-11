import { Card, RiskBadge } from "@sentinel/ui";

type RiskLevel = "critical" | "high" | "medium" | "low" | "safe";

function getLevel(score: number): RiskLevel {
	if (score < 20) return "critical";
	if (score < 40) return "high";
	if (score < 60) return "medium";
	if (score < 80) return "low";
	return "safe";
}

const LEVEL_COLORS: Record<RiskLevel, string> = {
	critical: "#c43030",
	high: "#d4952a",
	medium: "#b89a30",
	low: "#4da035",
	safe: "#38892e",
};

type InfoCardProps = {
	address: string;
	type: string;
	threshold: { current: number; total: number };
	created: string;
	lastActivity: string;
	score?: number;
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
		<div className="flex items-center justify-between py-3 border-b border-border-subtle last:border-b-0">
			<span className="text-text-tertiary text-sm uppercase tracking-wider font-semibold">
				{label}
			</span>
			<span className={`text-text-primary text-md ${mono ? "font-mono" : ""}`}>
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
}: InfoCardProps) {
	const truncated = `${address.slice(0, 8)}...${address.slice(-6)}`;

	return (
		<Card variant="default" padding="lg">
			<div className="flex items-center justify-between pb-4 border-b border-border-subtle">
				<h3 className="text-lg font-semibold">Multisig Info</h3>
				{score !== undefined && (
					<span
						className="flex items-center gap-1"
						style={{ color: LEVEL_COLORS[getLevel(score)] }}
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
			</div>
		</Card>
	);
}
