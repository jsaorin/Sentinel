import type { ReactNode } from "react";
import Link from "next/link";
import { RiskBadge } from "@sentinel/ui";
import type { RiskLevel } from "@/lib/risk";

type StatsListRowProps = {
	icon: ReactNode;
	primaryText: string;
	secondaryText: string;
	metadata: string;
	riskLevel: RiskLevel;
	isLast?: boolean;
	href?: string;
};

export function StatsListRow({
	icon,
	primaryText,
	secondaryText,
	metadata,
	riskLevel,
	isLast = false,
	href,
}: StatsListRowProps) {
	const content = (
		<>
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
			<div className="flex items-center gap-4 shrink-0 ml-3">
				<span className="text-xs font-semibold tracking-wider uppercase text-text-secondary hidden sm:block w-24 text-start">
					{metadata}
				</span>
				<RiskBadge level={riskLevel} size="sm" className="w-24 justify-start" />
			</div>
		</>
	);

	const className = [
		"flex items-center justify-between py-3 px-1 hover:bg-bg-hover transition-colors cursor-pointer",
		!isLast ? "border-b border-border-subtle" : "",
	].join(" ");

	if (href) {
		return (
			<Link href={href} className={className}>
				{content}
			</Link>
		);
	}

	return <div className={className}>{content}</div>;
}
