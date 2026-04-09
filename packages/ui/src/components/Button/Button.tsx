import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: ButtonVariant;
	size?: ButtonSize;
	isLoading?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
	primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
	secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500",
	ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
	destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
};

const sizeClasses: Record<ButtonSize, string> = {
	sm: "px-3 py-1.5 text-sm",
	md: "px-4 py-2 text-base",
	lg: "px-6 py-3 text-lg",
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
				"transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
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
