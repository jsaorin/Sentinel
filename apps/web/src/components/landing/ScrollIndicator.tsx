"use client";

import { useEffect, useState } from "react";

export function ScrollIndicator() {
	const [visible, setVisible] = useState(true);

	useEffect(() => {
		function handleScroll() {
			setVisible(window.scrollY < 250);
		}
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<div
			className="z-50 absolute bottom-6 left-1/2 -translate-x-1/2 flex justify-center"
			style={{
				opacity: visible ? 1 : 0,
				pointerEvents: visible ? "auto" : "none",
			}}
		>
			{/* Soft white fog */}
			<div
				className="absolute -inset-x-28 -top-14 -bottom-8"
				style={{
					background:
						"radial-gradient(ellipse at center, rgba(255,255,255,0.42) 0%, transparent 65%)",
					filter: "blur(25px)",
				}}
			/>
			<div className="relative flex flex-col items-center gap-2 animate-bounce">
				<span className="text-sm text-white tracking-wider">
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
					className="text-white"
					aria-hidden="true"
				>
					<polyline points="6 9 12 15 18 9" />
				</svg>
			</div>
		</div>
	);
}
