import { RiskBadge } from "@sentinel/ui";

type RiskLevel = "critical" | "high" | "medium" | "low" | "safe" | "info" | "unknown";

type SignerRowProps = {
	address: string;
	label: string;
	status: string;
	riskLevel: RiskLevel;
	isLast?: boolean;
};

export function SignerRow({ address, label, status, riskLevel, isLast = false }: SignerRowProps) {
	return (
		<div
			className={[
				"flex items-center justify-between py-4 px-2",
				!isLast ? "border-b border-border-subtle" : "",
			].join(" ")}
		>
			<div className="flex items-center gap-4 min-w-0">
				<span className="font-mono text-md text-text-primary">{address}</span>
				<span className="text-md text-text-secondary hidden sm:block">{label}</span>
			</div>
			<div className="flex items-center gap-4 shrink-0">
				<span className={`text-sm ${status === "Active" ? "text-text-secondary" : "text-text-tertiary"}`}>
					{status}
				</span>
				<RiskBadge level={riskLevel} size="sm" />
			</div>
		</div>
	);
}
