import { Card } from "@sentinel/ui";

type InfoCardProps = {
	address: string;
	type: string;
	threshold: { current: number; total: number };
	created: string;
	lastActivity: string;
};

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
	return (
		<div className="flex items-center justify-between py-3 border-b border-border-subtle last:border-b-0">
			<span className="text-text-tertiary text-sm uppercase tracking-wider font-semibold">{label}</span>
			<span className={`text-text-primary text-md ${mono ? "font-mono" : ""}`}>{value}</span>
		</div>
	);
}

export function InfoCard({ address, type, threshold, created, lastActivity }: InfoCardProps) {
	const truncated = `${address.slice(0, 8)}...${address.slice(-6)}`;

	return (
		<Card variant="default" padding="lg">
			<h3 className="font-display text-lg font-semibold pb-4 border-b border-border-subtle">Multisig Info</h3>
			<div className="mt-1">
				<InfoRow label="Address" value={truncated} mono />
				<InfoRow label="Type" value={type} />
				<InfoRow label="Threshold" value={`${threshold.current} of ${threshold.total}`} />
				<InfoRow label="Created" value={created} mono />
				<InfoRow label="Last Activity" value={lastActivity} />
			</div>
		</Card>
	);
}
