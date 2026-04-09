import type { ReactNode } from "react";
import { RiskBadge } from "@sentinel/ui";

type RiskLevel = "critical" | "high" | "medium" | "low" | "safe" | "info" | "unknown";

type StatsListRowProps = {
	icon: ReactNode;
	primaryText: string;
	secondaryText: string;
	metadata: string;
	riskLevel: RiskLevel;
	isLast?: boolean;
};

export function StatsListRow({
	icon,
	primaryText,
	secondaryText,
	metadata,
	riskLevel,
	isLast = false,
}: StatsListRowProps) {
	return (
		<div
			className={[
				"flex items-center justify-between py-3 px-1",
				!isLast ? "border-b border-border-subtle" : "",
			].join(" ")}
		>
			<div className="flex items-center gap-3 min-w-0">
				<div className="shrink-0 w-9 h-9 flex items-center justify-center text-text-tertiary">
					{icon}
				</div>
				<div className="min-w-0">
					<span className="font-mono text-md text-text-link block truncate">
						{primaryText}
					</span>
					<span className="text-xs text-text-tertiary">{secondaryText}</span>
				</div>
			</div>
			<div className="flex items-center gap-3 shrink-0 ml-3">
				<span className="text-sm text-text-secondary hidden sm:block">{metadata}</span>
				<RiskBadge level={riskLevel} size="sm" />
			</div>
		</div>
	);
}
