import type { HTMLAttributes } from "react";
import {
	ExclamationTriangleIcon,
	ShieldExclamationIcon,
	ExclamationCircleIcon,
	CheckCircleIcon,
	ShieldCheckIcon,
	InformationCircleIcon,
	QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

type RiskLevel =
	| "critical"
	| "high"
	| "medium"
	| "low"
	| "safe"
	| "info"
	| "unknown";

type RiskBadgeProps = HTMLAttributes<HTMLSpanElement> & {
	level: RiskLevel;
	size?: "sm" | "md";
};

const levelConfig: Record<
	RiskLevel,
	{ label: string; icon: typeof ShieldCheckIcon; color: string }
> = {
	critical: {
		label: "CRITICAL",
		icon: ShieldExclamationIcon,
		color: "#c43030",
	},
	high: { label: "HIGH", icon: ExclamationTriangleIcon, color: "#d4952a" },
	medium: { label: "MEDIUM", icon: ExclamationCircleIcon, color: "#b89a30" },
	low: { label: "LOW", icon: CheckCircleIcon, color: "#4da035" },
	safe: { label: "SAFE", icon: ShieldCheckIcon, color: "#38892e" },
	info: { label: "INFO", icon: InformationCircleIcon, color: "#3a7abf" },
	unknown: { label: "UNKNOWN", icon: QuestionMarkCircleIcon, color: "#5a5f68" },
};

export function RiskBadge({
	level,
	size = "sm",
	className = "",
	...props
}: RiskBadgeProps) {
	const config = levelConfig[level];
	const IconComponent = config.icon;
	const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

	return (
		<span
			className={[
				"flex items-center gap-1 font-semibold tracking-wider whitespace-nowrap",
				size === "sm" ? "text-xs" : "text-sm",
				className,
			].join(" ")}
			style={{ color: config.color }}
			aria-label={`Risk level: ${config.label}`}
			{...props}
		>
			<IconComponent className={`${iconSize} shrink-0`} aria-hidden="true" />
			{config.label}
		</span>
	);
}
