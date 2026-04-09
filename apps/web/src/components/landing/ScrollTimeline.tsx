"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type ScrollTimelineProps = {
	children: ReactNode;
	nodeCount: number;
};

export function ScrollTimeline({ children, nodeCount }: ScrollTimelineProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [scrollProgress, setScrollProgress] = useState(0);
	const [activeNodes, setActiveNodes] = useState<Set<number>>(new Set());

	useEffect(() => {
		const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (prefersReduced) {
			setScrollProgress(1);
			setActiveNodes(new Set(Array.from({ length: nodeCount }, (_, i) => i)));
			return;
		}

		let rafId: number;
		function handleScroll() {
			rafId = requestAnimationFrame(() => {
				const scrollY = window.scrollY;
				const docHeight = document.documentElement.scrollHeight - window.innerHeight;
				const progress = docHeight > 0 ? Math.min(scrollY / docHeight, 1) : 0;
				setScrollProgress(progress);

				const newActive = new Set<number>();
				for (let i = 0; i < nodeCount; i++) {
					if (progress >= i / Math.max(nodeCount - 1, 1) * 0.85) {
						newActive.add(i);
					}
				}
				setActiveNodes(newActive);
			});
		}

		window.addEventListener("scroll", handleScroll, { passive: true });
		handleScroll();

		return () => {
			window.removeEventListener("scroll", handleScroll);
			cancelAnimationFrame(rafId);
		};
	}, [nodeCount]);

	const nodePositions = Array.from({ length: nodeCount }, (_, i) =>
		nodeCount > 1 ? `${(i / (nodeCount - 1)) * 100}%` : "0%",
	);

	return (
		<div ref={containerRef} className="relative">
			{/* Timeline — hidden on mobile */}
			<div className="hidden md:block absolute left-8 top-0 bottom-0 w-px z-10">
				{/* Track */}
				<div className="timeline-line absolute inset-0" />
				{/* Fill */}
				<div
					className="timeline-fill absolute inset-x-0 top-0 bottom-0"
					style={{ transform: `scaleY(${scrollProgress})` }}
				/>
				{/* Nodes */}
				{nodePositions.map((top, i) => (
					<div
						key={`node-${i}`}
						className={[
							"timeline-node absolute -left-1.5",
							activeNodes.has(i) ? "timeline-node--active" : "",
						].join(" ")}
						style={{ top }}
					/>
				))}
			</div>

			{/* Content */}
			<div className="md:ml-16">{children}</div>
		</div>
	);
}
