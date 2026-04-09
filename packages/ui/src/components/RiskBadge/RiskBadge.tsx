import type { HTMLAttributes } from "react";

type RiskLevel = "critical" | "high" | "medium" | "low" | "safe" | "info" | "unknown";

type RiskBadgeProps = HTMLAttributes<HTMLSpanElement> & {
	level: RiskLevel;
	showIcon?: boolean;
	showLabel?: boolean;
	size?: "sm" | "md";
};

const levelConfig: Record<RiskLevel, { label: string; icon: string; classes: string }> = {
	critical: {
		label: "Critical",
		icon: "⛔",
		classes: "bg-critical-subtle text-critical",
	},
	high: {
		label: "High",
		icon: "⚠",
		classes: "bg-high-subtle text-high",
	},
	medium: {
		label: "Medium",
		icon: "●",
		classes: "bg-medium-subtle text-medium",
	},
	low: {
		label: "Low",
		icon: "✓",
		classes: "bg-low-subtle text-low",
	},
	safe: {
		label: "Safe",
		icon: "🛡",
		classes: "bg-safe-subtle text-safe",
	},
	info: {
		label: "Info",
		icon: "ℹ",
		classes: "bg-info-subtle text-info",
	},
	unknown: {
		label: "Unknown",
		icon: "?",
		classes: "bg-unknown-subtle text-unknown",
	},
};

const sizeClasses = {
	sm: "px-2 py-0.5 text-xs gap-1",
	md: "px-2.5 py-1 text-sm gap-1.5",
};

export function RiskBadge({
	level,
	showIcon = true,
	showLabel = true,
	size = "sm",
	className = "",
	...props
}: RiskBadgeProps) {
	const config = levelConfig[level];

	return (
		<span
			className={[
				"inline-flex items-center rounded-full font-semibold tracking-wider uppercase",
				sizeClasses[size],
				config.classes,
				className,
			].join(" ")}
			aria-label={`Risk level: ${config.label}`}
			{...props}
		>
			{showIcon && <span aria-hidden="true">{config.icon}</span>}
			{showLabel && <span>{config.label}</span>}
		</span>
	);
}
