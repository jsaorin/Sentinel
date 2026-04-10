import type { HTMLAttributes } from "react";

type CardVariant = "default" | "raised" | "outlined";
type CardPadding = "sm" | "md" | "lg";

type CardProps = HTMLAttributes<HTMLDivElement> & {
	variant?: CardVariant;
	padding?: CardPadding;
};

const variantClasses: Record<CardVariant, string> = {
	default: "bg-bg-card border border-border-subtle shadow-sm",
	raised: "bg-bg-raised border border-border-default shadow-md",
	outlined: "bg-transparent border border-border-strong",
};

const paddingClasses: Record<CardPadding, string> = {
	sm: "p-4",
	md: "p-5",
	lg: "p-6",
};

export function Card({
	variant = "default",
	padding = "md",
	className = "",
	children,
	...props
}: CardProps) {
	return (
		<div
			className={[
				"rounded-md",
				variantClasses[variant],
				paddingClasses[padding],
				className,
			].join(" ")}
			{...props}
		>
			{children}
		</div>
	);
}
