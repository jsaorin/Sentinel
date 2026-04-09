import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
	padding?: "sm" | "md" | "lg";
};

const paddingClasses = { sm: "p-4", md: "p-6", lg: "p-8" };

export function Card({ padding = "md", className = "", children, ...props }: CardProps) {
	return (
		<div
			className={[
				"rounded-lg border border-gray-200 bg-white shadow-sm",
				paddingClasses[padding],
				className,
			].join(" ")}
			{...props}
		>
			{children}
		</div>
	);
}
