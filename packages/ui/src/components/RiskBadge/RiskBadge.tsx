import type { HTMLAttributes } from "react";

type RiskLevel = "critical" | "high" | "medium" | "low" | "safe" | "info" | "unknown";

type RiskBadgeProps = HTMLAttributes<HTMLSpanElement> & {
	level: RiskLevel;
	size?: "sm" | "md";
};

const levelConfig: Record<RiskLevel, { label: string; classes: string }> = {
	critical: { label: "Critical", classes: "bg-critical-subtle text-critical" },
	high: { label: "High", classes: "bg-high-subtle text-high" },
	medium: { label: "Medium", classes: "bg-medium-subtle text-medium" },
	low: { label: "Low", classes: "bg-low-subtle text-low" },
	safe: { label: "Safe", classes: "bg-safe-subtle text-safe" },
	info: { label: "Info", classes: "bg-info-subtle text-info" },
	unknown: { label: "Unknown", classes: "bg-unknown-subtle text-unknown" },
};

const sizeClasses = {
	sm: "px-2 py-0.5 text-xs",
	md: "px-2.5 py-1 text-sm",
};

export function RiskBadge({
	level,
	size = "sm",
	className = "",
	...props
}: RiskBadgeProps) {
	const config = levelConfig[level];

	return (
		<span
			className={[
				"inline-flex items-center font-semibold tracking-wider uppercase",
				sizeClasses[size],
				config.classes,
				className,
			].join(" ")}
			aria-label={`Risk level: ${config.label}`}
			{...props}
		>
			{config.label}
		</span>
	);
}
