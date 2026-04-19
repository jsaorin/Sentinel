"use client";

import { useEffect, useRef } from "react";

const SCORE = 73;
const SCORE_LABEL = "LOW RISK";
const SCORE_RGB = "56, 137, 46"; // --color-safe
const TICK_COUNT = 60;
// The arc spans 270deg (from 135deg to 405deg), leaving a gap at the bottom
const ARC_START = (Math.PI * 3) / 4; // 135deg
const ARC_SWEEP = (Math.PI * 3) / 2; // 270deg
const ARC_END = ARC_START + ARC_SWEEP;
const SCORE_ANGLE = ARC_START + (SCORE / 100) * ARC_SWEEP;

export function ScoringVisual() {
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

		const cx = w / 2;
		const cy = h / 2;
		const ringR = Math.min(w, h) * 0.36;
		const dotR = 5;

		// Animate the green arc from 0 -> score angle
		let progress = prefersReduced ? 1 : 0; // 0->1
		const fillSpeed = 0.011;

		let animId: number;
		let isVisible = false;
		let hasStarted = false;

		const visObserver = new IntersectionObserver(
			([entry]) => {
				isVisible = entry.isIntersecting;
				if (isVisible && !hasStarted) {
					hasStarted = true;
					progress = prefersReduced ? 1 : 0;
					draw();
				} else if (isVisible && progress < 1) {
					draw();
				}
			},
			{ threshold: 0.3 },
		);
		visObserver.observe(container);

		function draw() {
			if (!ctx || !isVisible) return;
			ctx.clearRect(0, 0, w, h);

			// Advance fill
			if (!prefersReduced && progress < 1) {
				progress = Math.min(1, progress + fillSpeed);
			}

			const currentAngle = ARC_START + progress * (SCORE_ANGLE - ARC_START);

			// Faint green glow behind ring
			const ringGlow = ctx.createRadialGradient(
				cx,
				cy,
				ringR * 0.7,
				cx,
				cy,
				ringR * 1.4,
			);
			ringGlow.addColorStop(0, `rgba(${SCORE_RGB}, ${0.03 * progress})`);
			ringGlow.addColorStop(1, `rgba(${SCORE_RGB}, 0)`);
			ctx.beginPath();
			ctx.arc(cx, cy, ringR * 1.4, 0, Math.PI * 2);
			ctx.fillStyle = ringGlow;
			ctx.fill();

			// Background arc (full track, dim)
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

			// Green filled arc (0 -> current score)
			if (progress > 0) {
				ctx.beginPath();
				ctx.arc(cx, cy, ringR, ARC_START, currentAngle);
				ctx.strokeStyle = `rgba(${SCORE_RGB}, 0.8)`;
				ctx.lineWidth = 3;
				ctx.lineCap = "round";
				ctx.stroke();
			}

			// Dot at the current end of the green arc
			const dotX = cx + Math.cos(currentAngle) * ringR;
			const dotY = cy + Math.sin(currentAngle) * ringR;

			// Dot glow
			const dotGlow = ctx.createRadialGradient(
				dotX,
				dotY,
				0,
				dotX,
				dotY,
				dotR * 6,
			);
			dotGlow.addColorStop(0, `rgba(${SCORE_RGB}, 0.3)`);
			dotGlow.addColorStop(1, `rgba(${SCORE_RGB}, 0)`);
			ctx.beginPath();
			ctx.arc(dotX, dotY, dotR * 6, 0, Math.PI * 2);
			ctx.fillStyle = dotGlow;
			ctx.fill();

			// Dot core
			ctx.beginPath();
			ctx.arc(dotX, dotY, dotR, 0, Math.PI * 2);
			ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
			ctx.fill();

			// Score number
			ctx.font = "700 42px monospace";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + progress * 0.5})`;
			ctx.fillText(String(Math.round(SCORE * progress)), cx, cy - 8);

			// Risk label
			ctx.font = "600 10px monospace";
			ctx.fillStyle = `rgba(${SCORE_RGB}, ${progress * 0.8})`;
			ctx.fillText(SCORE_LABEL, cx, cy + 22);

			// Keep animating while filling, then stop
			if (progress < 1) {
				animId = requestAnimationFrame(draw);
			}
		}

		return () => {
			cancelAnimationFrame(animId);
			visObserver.disconnect();
		};
	}, []);

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
