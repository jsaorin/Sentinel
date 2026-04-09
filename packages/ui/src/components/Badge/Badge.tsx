import type { HTMLAttributes } from "react";

type BadgeVariant = "critical" | "high" | "medium" | "low" | "safe" | "info" | "unknown";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
	variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
	critical: "bg-critical-subtle border-critical-border text-critical",
	high: "bg-high-subtle border-high-border text-high",
	medium: "bg-medium-subtle border-medium-border text-medium",
	low: "bg-low-subtle border-low-border text-low",
	safe: "bg-safe-subtle border-safe-border text-safe",
	info: "bg-info-subtle border-info-border text-info",
	unknown: "bg-unknown-subtle border-unknown-border text-unknown",
};

export function Badge({ variant = "unknown", className = "", children, ...props }: BadgeProps) {
	return (
		<span
			className={[
				"inline-flex items-center rounded-full border px-2.5 py-0.5",
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
