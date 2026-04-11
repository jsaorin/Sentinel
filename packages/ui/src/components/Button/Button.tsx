import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: ButtonVariant;
	size?: ButtonSize;
	isLoading?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
	primary:
		"bg-primary text-text-inverse hover:bg-primary-hover focus:ring-primary",
	secondary:
		"bg-bg-raised border border-border-default text-text-primary hover:bg-bg-overlay focus:ring-border-strong",
	ghost:
		"bg-transparent text-text-secondary hover:bg-bg-hover focus:ring-border-default",
	destructive: "bg-critical text-white hover:opacity-80 focus:ring-critical",
};

const sizeClasses: Record<ButtonSize, string> = {
	sm: "px-3 py-1.5 text-sm",
	md: "px-4 py-2 text-base",
	lg: "px-6 py-3 text-md",
};

export function Button({
	variant = "primary",
	size = "md",
	isLoading = false,
	disabled,
	className = "",
	children,
	...props
}: ButtonProps) {
	return (
		<button
			className={[
				"inline-flex items-center justify-center rounded-md font-medium",
				"transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-base",
				"disabled:opacity-50 disabled:pointer-events-none",
				variantClasses[variant],
				sizeClasses[size],
				className,
			].join(" ")}
			disabled={disabled || isLoading}
			{...props}
		>
			{isLoading ? "Loading..." : children}
		</button>
	);
}
