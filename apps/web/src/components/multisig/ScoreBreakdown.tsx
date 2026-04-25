"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@sentinel/ui";
import { getLevel, LEVEL_LABELS, LEVEL_HEX } from "@/lib/risk";

type BreakdownItem = {
	label: string;
	value: number;
};

type ScoreBreakdownProps = {
	breakdown: {
		threshold: number;
		configAuthority: number;
		signerConcentration: number;
		signerCount: number;
	};
	calculatedAt?: string;
};

function ScoreBar({ item }: { item: BreakdownItem }) {
	const [animated, setAnimated] = useState(0);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					requestAnimationFrame(() => setAnimated(item.value));
					observer.disconnect();
				}
			},
			{ threshold: 0.1 },
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, [item.value]);

	const level = getLevel(item.value);
	const color = LEVEL_HEX[level];
	const label = LEVEL_LABELS[level];

	return (
		<div
			ref={ref}
			className="py-3 border-b border-border-subtle last:border-b-0"
		>
			<div className="flex items-center justify-between mb-2">
				<span className="text-xs font-semibold tracking-wider uppercase text-text-secondary">
					{item.label}
				</span>
				<div className="flex items-center gap-2">
					<span className="font-mono text-md tabular-nums text-text-primary">
						{item.value}
					</span>
					<span
						className="text-xs font-semibold tracking-wider uppercase opacity-80"
						style={{ color }}
					>
						{label}
					</span>
				</div>
			</div>
			<div className="w-full h-1.5 rounded-full bg-bg-overlay overflow-hidden">
				<div
					className="h-full rounded-full transition-all duration-700 ease-out opacity-60"
					style={{
						width: `${animated}%`,
						backgroundColor: color,
					}}
				/>
			</div>
		</div>
	);
}

function timeAgo(date: Date): string {
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMin = Math.floor(diffMs / 60000);
	if (diffMin < 1) return "just now";
	if (diffMin < 60) return `${diffMin} min ago`;
	const diffHr = Math.floor(diffMin / 60);
	if (diffHr < 24) return `${diffHr} hr ago`;
	const diffDays = Math.floor(diffHr / 24);
	return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

export function ScoreBreakdown({
	breakdown,
	calculatedAt,
}: ScoreBreakdownProps) {
	const items: BreakdownItem[] = [
		{ label: "Threshold", value: breakdown.threshold },
		{ label: "Config Authority", value: breakdown.configAuthority },
		{ label: "Signer Concentration", value: breakdown.signerConcentration },
		{ label: "Signer Count", value: breakdown.signerCount },
	];

	return (
		<Card variant="default" padding="lg">
			<h3 className="text-lg font-semibold pb-4 border-b border-border-subtle">
				Score Breakdown
			</h3>
			<div className="mt-1">
				{items.map((item) => (
					<ScoreBar key={item.label} item={item} />
				))}
			</div>
			{calculatedAt && (
				<p className="text-xs text-text-tertiary mt-4">
					Last scored: {timeAgo(new Date(calculatedAt))}
				</p>
			)}
		</Card>
	);
}
