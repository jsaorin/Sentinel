"use client";

import { useEffect, useRef } from "react";

type ScoreCardProps = {
	score: number;
};

type RiskLevel = "critical" | "high" | "medium" | "low" | "safe";

function getLevel(score: number): RiskLevel {
	if (score < 20) return "critical";
	if (score < 40) return "high";
	if (score < 60) return "medium";
	if (score < 80) return "low";
	return "safe";
}

const LEVEL_LABELS: Record<RiskLevel, string> = {
	critical: "CRITICAL",
	high: "HIGH RISK",
	medium: "MEDIUM RISK",
	low: "LOW RISK",
	safe: "SAFE",
};

const LEVEL_RGB: Record<RiskLevel, string> = {
	critical: "196, 48, 48",
	high: "212, 149, 42",
	medium: "184, 154, 48",
	low: "77, 160, 53",
	safe: "56, 137, 46",
};

const TICK_COUNT = 60;
const ARC_START = (Math.PI * 3) / 4;
const ARC_SWEEP = (Math.PI * 3) / 2;
const ARC_END = ARC_START + ARC_SWEEP;

export function ScoreCard({ score }: ScoreCardProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		const container = containerRef.current;
		if (!canvas || !container) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const dpr = window.devicePixelRatio || 1;
		const rect = container.getBoundingClientRect();
		const w = Math.round(rect.width);
		const h = Math.round(rect.height);
		canvas.width = w * dpr;
		canvas.height = h * dpr;
		canvas.style.width = `${w}px`;
		canvas.style.height = `${h}px`;
		ctx.scale(dpr, dpr);

		const prefersReduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;

		const level = getLevel(score);
		const rgb = LEVEL_RGB[level];
		const label = LEVEL_LABELS[level];
		const scoreAngle = ARC_START + (score / 100) * ARC_SWEEP;

		const cx = w / 2;
		const cy = h / 2;
		const ringR = Math.min(w, h) * 0.36;
		const dotR = 5;

		let progress = prefersReduced ? 1 : 0;
		const fillSpeed = 0.011;

		let animId: number;
		let isVisible = true;

		const visObserver = new IntersectionObserver(
			([entry]) => {
				isVisible = entry.isIntersecting;
				if (isVisible) draw();
			},
			{ threshold: 0 },
		);
		visObserver.observe(container);

		function draw() {
			if (!ctx || !isVisible) return;
			ctx.clearRect(0, 0, w, h);

			if (!prefersReduced && progress < 1) {
				progress = Math.min(1, progress + fillSpeed);
			}

			const currentAngle = ARC_START + progress * (scoreAngle - ARC_START);

			// Faint glow behind ring
			const ringGlow = ctx.createRadialGradient(
				cx, cy, ringR * 0.7,
				cx, cy, ringR * 1.4,
			);
			ringGlow.addColorStop(0, `rgba(${rgb}, ${0.03 * progress})`);
			ringGlow.addColorStop(1, `rgba(${rgb}, 0)`);
			ctx.beginPath();
			ctx.arc(cx, cy, ringR * 1.4, 0, Math.PI * 2);
			ctx.fillStyle = ringGlow;
			ctx.fill();

			// Background arc
			ctx.beginPath();
			ctx.arc(cx, cy, ringR, ARC_START, ARC_END);
			ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
			ctx.lineWidth = 3;
			ctx.lineCap = "round";
			ctx.stroke();

			// Tick marks
			for (let i = 0; i <= TICK_COUNT; i++) {
				const t = i / TICK_COUNT;
				const tickAngle = ARC_START + t * ARC_SWEEP;
				const isMajor = i % 5 === 0;
				const innerR = ringR - (isMajor ? 8 : 5);
				const outerR = ringR + (isMajor ? 3 : 1);

				ctx.beginPath();
				ctx.moveTo(
					cx + Math.cos(tickAngle) * innerR,
					cy + Math.sin(tickAngle) * innerR,
				);
				ctx.lineTo(
					cx + Math.cos(tickAngle) * outerR,
					cy + Math.sin(tickAngle) * outerR,
				);
				ctx.strokeStyle = isMajor
					? "rgba(255, 255, 255, 0.15)"
					: "rgba(255, 255, 255, 0.06)";
				ctx.lineWidth = isMajor ? 1.2 : 0.8;
				ctx.lineCap = "butt";
				ctx.stroke();
			}

			// Filled arc
			if (progress > 0) {
				ctx.beginPath();
				ctx.arc(cx, cy, ringR, ARC_START, currentAngle);
				ctx.strokeStyle = `rgba(${rgb}, 0.8)`;
				ctx.lineWidth = 3;
				ctx.lineCap = "round";
				ctx.stroke();
			}

			// Dot at end of arc
			const dotX = cx + Math.cos(currentAngle) * ringR;
			const dotY = cy + Math.sin(currentAngle) * ringR;

			const dotGlow = ctx.createRadialGradient(
				dotX, dotY, 0,
				dotX, dotY, dotR * 6,
			);
			dotGlow.addColorStop(0, `rgba(${rgb}, 0.3)`);
			dotGlow.addColorStop(1, `rgba(${rgb}, 0)`);
			ctx.beginPath();
			ctx.arc(dotX, dotY, dotR * 6, 0, Math.PI * 2);
			ctx.fillStyle = dotGlow;
			ctx.fill();

			ctx.beginPath();
			ctx.arc(dotX, dotY, dotR, 0, Math.PI * 2);
			ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
			ctx.fill();

			// Score number
			ctx.font = "700 42px monospace";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + progress * 0.5})`;
			ctx.fillText(String(Math.round(score * progress)), cx, cy - 8);

			// Risk label
			ctx.font = "600 10px monospace";
			ctx.fillStyle = `rgba(${rgb}, ${progress * 0.8})`;
			ctx.fillText(label, cx, cy + 22);

			if (progress < 1) {
				animId = requestAnimationFrame(draw);
			}
		}

		draw();
		return () => {
			cancelAnimationFrame(animId);
			visObserver.disconnect();
		};
	}, [score]);

	return (
		<div
			ref={containerRef}
			className="w-full aspect-square max-w-xs mx-auto"
			aria-hidden="true"
		>
			<canvas ref={canvasRef} className="w-full h-full" />
		</div>
	);
}
