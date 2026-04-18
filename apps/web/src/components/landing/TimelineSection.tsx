"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type TimelineSectionProps = {
	children: ReactNode;
};

export function TimelineSection({ children }: TimelineSectionProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [opacity, setOpacity] = useState(0);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const prefersReduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		if (prefersReduced) {
			setOpacity(1);
			return;
		}

		const isMobile = window.innerWidth < 768;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					const ratio = entry.intersectionRatio;
					// Mobile: fade in quickly; Desktop: delay until 25% visible
					const progress = isMobile
						? Math.min(ratio / 0.15, 1)
						: ratio < 0.25
							? 0
							: Math.min((ratio - 0.25) / 0.45, 1);
					setOpacity(progress);
				}
			},
			{ threshold: Array.from({ length: 20 }, (_, i) => i / 19) },
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return (
		<div
			ref={ref}
			style={{
				opacity,
				transform: `translateY(${1 - opacity}px)`,
				transition: "opacity 300ms ease-out, transform 300ms ease-out",
			}}
			className="mt-4 md:mt-8 lg:mt-0"
		>
			{children}
		</div>
	);
}
