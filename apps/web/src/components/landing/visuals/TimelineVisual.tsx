"use client";

import { useEffect, useRef } from "react";

// Zig-zag node positions as fractions of canvas (x%, y%)
const CHAIN_NODES = [
	{ xPct: 0.35, yPct: 0.12, label: "Nonce Created" },
	{ xPct: 0.72, yPct: 0.25, label: "9 Days Dormant" },
	{ xPct: 0.2, yPct: 0.45, label: "Execution Attempted" },
	{ xPct: 0.72, yPct: 0.55, label: "Attacker" },
	{ xPct: 0.4, yPct: 0.75, label: "BLOCKED" },
];

export function TimelineVisual() {
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

		const positions = CHAIN_NODES.map((n) => ({
			x: n.xPct * w,
			y: n.yPct * h,
		}));
		const nodeR = 10;

		// Connections: [from, to]
		// Main chain: 0->1->2->4   Attacker branch: 3->2
		const mainPath = [0, 1, 2, 4]; // node indices for traveling signal
		const connections: Array<[number, number]> = [
			[0, 1],
			[1, 2],
			[2, 4],
			[3, 2],
		];

		// Pre-compute main chain segment lengths for signal
		const mainSegLengths: number[] = [];
		let mainTotalLen = 0;
		for (let i = 0; i < mainPath.length - 1; i++) {
			const a = positions[mainPath[i]];
			const b = positions[mainPath[i + 1]];
			const len = Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
			mainSegLengths.push(len);
			mainTotalLen += len;
		}

		// Attacker branch signal (separate, red pulse from 3->2)
		let attackerSignal = -0.2;
		const attackerSpeed = 0.005;
		let attackerPause = 40;

		// Main signal
		let signal = -0.1;
		const signalSpeed = 0.003;
		let pauseFrames = 0;
		let blockedHeat = 0;

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

		function drawPulseOnSegment(
			ax: number,
			ay: number,
			bx: number,
			by: number,
			sig: number,
			segStart: number,
			segEnd: number,
			rgb: string,
		) {
			if (!ctx) return;
			const streakLen = 0.08;
			const sigTail = sig - streakLen;
			const range = segEnd - segStart;
			if (range <= 0) return;
			const t0 = Math.max(0, (Math.max(sigTail, segStart) - segStart) / range);
			const t1 = Math.min(1, (Math.min(sig, segEnd) - segStart) / range);
			if (t1 <= 0 || t0 >= 1 || t1 <= t0) return;

			const x0 = ax + (bx - ax) * t0;
			const y0 = ay + (by - ay) * t0;
			const x1 = ax + (bx - ax) * t1;
			const y1 = ay + (by - ay) * t1;

			const grad = ctx.createLinearGradient(x0, y0, x1, y1);
			grad.addColorStop(0, `rgba(${rgb}, 0)`);
			grad.addColorStop(0.5, `rgba(${rgb}, 0.6)`);
			grad.addColorStop(1, `rgba(${rgb}, 0)`);
			ctx.beginPath();
			ctx.moveTo(x0, y0);
			ctx.lineTo(x1, y1);
			ctx.strokeStyle = grad;
			ctx.lineWidth = 1.5;
			ctx.stroke();
		}

		function draw() {
			if (!ctx || !isVisible) return;
			ctx.clearRect(0, 0, w, h);

			// Advance main signal
			if (!prefersReduced) {
				if (pauseFrames > 0) {
					pauseFrames--;
				} else {
					signal += signalSpeed;
					if (signal > 1.12) {
						signal = -0.1;
						pauseFrames = 80;
					}
				}
				if (signal >= 0.95) {
					blockedHeat = Math.min(1, blockedHeat + 0.04);
				} else {
					blockedHeat = Math.max(0, blockedHeat - 0.01);
				}

				// Advance attacker signal
				if (attackerPause > 0) {
					attackerPause--;
				} else {
					attackerSignal += attackerSpeed;
					if (attackerSignal > 1.15) {
						attackerSignal = -0.2;
						attackerPause = 60;
					}
				}
			}

			// Draw all connection lines
			for (const [ai, bi] of connections) {
				const a = positions[ai];
				const b = positions[bi];
				ctx.beginPath();
				ctx.moveTo(a.x, a.y);
				ctx.lineTo(b.x, b.y);
				ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
				ctx.lineWidth = 0.8;
				ctx.stroke();
			}

			// Main chain traveling pulse (white)
			if (!prefersReduced) {
				let distAcc = 0;
				for (let i = 0; i < mainPath.length - 1; i++) {
					const a = positions[mainPath[i]];
					const b = positions[mainPath[i + 1]];
					const segLen = mainSegLengths[i];
					const segStart = distAcc / mainTotalLen;
					const segEnd = (distAcc + segLen) / mainTotalLen;
					drawPulseOnSegment(
						a.x,
						a.y,
						b.x,
						b.y,
						signal,
						segStart,
						segEnd,
						"255, 255, 255",
					);
					distAcc += segLen;
				}

				// Attacker pulse (red, from node 3 -> node 2)
				const atk = positions[3];
				const tgt = positions[2];
				drawPulseOnSegment(
					atk.x,
					atk.y,
					tgt.x,
					tgt.y,
					attackerSignal,
					0,
					1,
					"196, 48, 48",
				);
			}

			// Draw nodes
			const BLOCKED_IDX = 4;
			const ATTACKER_IDX = 3;
			for (let i = 0; i < positions.length; i++) {
				const p = positions[i];
				const isBlocked = i === BLOCKED_IDX;
				const isAttacker = i === ATTACKER_IDX;
				const heat = isBlocked ? blockedHeat : 0;
				const atkHeat = isAttacker ? Math.max(0, attackerSignal) : 0;

				// Color: white by default, red when heated (blocked/attacker)
				let rgb: string;
				if (isAttacker) {
					const rv = Math.round(255 - atkHeat * 59);
					const gv = Math.round(255 - atkHeat * 207);
					const bv = Math.round(255 - atkHeat * 207);
					rgb = `${rv}, ${gv}, ${bv}`;
				} else {
					const rv = Math.round(255 - heat * 59);
					const gv = Math.round(255 - heat * 207);
					const bv = Math.round(255 - heat * 207);
					rgb = `${rv}, ${gv}, ${bv}`;
				}

				const extraHeat = Math.max(heat, atkHeat);

				// Outer glow
				const glowR = nodeR * (5 + extraHeat * 3);
				const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
				glow.addColorStop(0, `rgba(${rgb}, ${0.2 + extraHeat * 0.2})`);
				glow.addColorStop(0.5, `rgba(${rgb}, ${0.05 + extraHeat * 0.05})`);
				glow.addColorStop(1, `rgba(${rgb}, 0)`);
				ctx.beginPath();
				ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
				ctx.fillStyle = glow;
				ctx.fill();

				// Core dot
				ctx.beginPath();
				ctx.arc(p.x, p.y, nodeR, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(${rgb}, 0.9)`;
				ctx.fill();

				// Label
				const isBold = isBlocked || isAttacker;
				ctx.font = isBold ? "700 10px monospace" : "500 10px monospace";
				ctx.textAlign = "center";
				ctx.fillStyle = isBold
					? `rgba(${rgb}, 0.8)`
					: "rgba(160, 160, 160, 0.6)";
				if (i === 2) {
					ctx.textBaseline = "bottom";
					ctx.fillText(CHAIN_NODES[i].label, p.x, p.y - nodeR - 12);
				} else {
					ctx.textBaseline = "top";
					ctx.fillText(CHAIN_NODES[i].label, p.x, p.y + nodeR + 16);
				}
			}

			animId = requestAnimationFrame(draw);
		}

		draw();
		return () => {
			cancelAnimationFrame(animId);
			visObserver.disconnect();
		};
	}, []);

	return (
		<div ref={containerRef} className="w-full h-80 md:h-96" aria-hidden="true">
			<canvas ref={canvasRef} className="w-full h-full" />
		</div>
	);
}
