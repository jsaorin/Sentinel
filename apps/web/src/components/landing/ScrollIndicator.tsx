"use client";

import { useEffect, useState } from "react";

export function ScrollIndicator() {
	const [visible, setVisible] = useState(true);

	useEffect(() => {
		function handleScroll() {
			setVisible(window.scrollY < 100);
		}
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<div
			className="py-6 flex justify-center transition-opacity duration-500"
			style={{
				opacity: visible ? 1 : 0,
				pointerEvents: visible ? "auto" : "none",
			}}
		>
			{/* Soft diffused fog — no hard edges */}
			<div
				className="absolute inset-0 -inset-x-20 -inset-y-12 rounded-full"
				style={{
					background:
						"radial-gradient(ellipse at center, rgba(80,80,80,0.35) 0%, rgba(50,50,50,0.15) 100%, transparent 70%)",
					filter: "blur(25px)",
				}}
			/>
			<div className="relative flex flex-col items-center gap-2 animate-bounce">
				<span className="text-sm text-text-secondary tracking-wider ">
					Scroll to Learn More
				</span>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="text-text-secondary"
					aria-hidden="true"
				>
					<polyline points="6 9 12 15 18 9" />
				</svg>
			</div>
		</div>
	);
}
