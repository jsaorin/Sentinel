import type { HTMLAttributes } from "react";

type BadgeVariant =
	| "critical"
	| "high"
	| "medium"
	| "low"
	| "safe"
	| "info"
	| "unknown";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
	variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
	critical: "bg-critical-subtle text-critical",
	high: "bg-high-subtle text-high",
	medium: "bg-medium-subtle text-medium",
	low: "bg-low-subtle text-low",
	safe: "bg-safe-subtle text-safe",
	info: "bg-info-subtle text-info",
	unknown: "bg-unknown-subtle text-unknown",
};

export function Badge({
	variant = "unknown",
	className = "",
	children,
	...props
}: BadgeProps) {
	return (
		<span
			className={[
				"inline-flex items-center py-0.5",
				"text-xs font-semibold tracking-wider uppercase",
				variantClasses[variant],
				className,
			].join(" ")}
			{...props}
		>
			{children}
		</span>
	);
}
