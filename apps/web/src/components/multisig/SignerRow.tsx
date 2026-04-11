import { Badge, RiskBadge } from "@sentinel/ui";
import type { RiskLevel } from "@/lib/risk";

type SignerRowProps = {
	address: string;
	label: string;
	status: string;
	riskLevel: RiskLevel;
	isLast?: boolean;
};

export function SignerRow({
	address,
	label,
	status,
	riskLevel,
	isLast = false,
}: SignerRowProps) {
	return (
		<div
			className={[
				"flex items-center justify-between py-4 px-2 hover:bg-bg-hover transition-colors",
				!isLast ? "border-b border-border-subtle" : "",
			].join(" ")}
		>
			<div className="flex items-center gap-4 min-w-0">
				<span className="font-mono text-md text-text-primary">{address}</span>
				<span className="text-md text-text-secondary hidden sm:block">
					{label}
				</span>
			</div>
			<div className="flex items-center gap-4 shrink-0">
				<Badge
					className={`w-24 justify-start text-xs font-semibold tracking-wider uppercase ${status === "Active" ? "text-text-primary" : "text-text-secondary"}`}
				>
					{status}
				</Badge>
				<RiskBadge level={riskLevel} size="sm" className="w-20 justify-start" />
			</div>
		</div>
	);
}
