"use client";

import { useEffect, useRef } from "react";

type FeatureVisualProps = {
	variant: "gauge" | "network" | "timeline";
};

type Node3D = {
	x: number;
	y: number;
	z: number;
	r: number;
	safe: boolean;
	hub: boolean;
};
type MeshResult = {
	nodes: Node3D[];
	connections: Array<[number, number]>;
};

const NODE_COUNT_DESKTOP = 2000;
const NODE_COUNT_MOBILE = 400;
// ~15% of nodes are "critical" (red), the rest are "safe" (green)
const CRITICAL_RATIO = 0.15;

function buildMesh(nodeCount: number): MeshResult {
	const nodes: Node3D[] = [];
	const connections: Array<[number, number]> = [];

	nodes.push({ x: 0, y: 0, z: 0, r: 16, safe: true, hub: true });

	function branch(
		parentIdx: number,
		dir: { x: number; y: number; z: number },
		length: number,
		depth: number,
	) {
		if (depth > 5 || nodes.length >= nodeCount) return;

		const parent = nodes[parentIdx];
		const jitter = length * 0.3;
		const node: Node3D = {
			x: parent.x + dir.x * length + (Math.random() - 0.5) * jitter,
			y: parent.y + dir.y * length + (Math.random() - 0.5) * jitter,
			z: parent.z + dir.z * length + (Math.random() - 0.5) * jitter,
			r: Math.max(3, 6 - depth * 0.9),
			safe: Math.random() > CRITICAL_RATIO,
			hub: false,
		};
		const idx = nodes.length;
		nodes.push(node);
		connections.push([parentIdx, idx]);

		const numBranches =
			depth < 2
				? 2 + Math.floor(Math.random() * 2)
				: 1 + Math.floor(Math.random() * 2);
		const nextLength = length * (0.65 + Math.random() * 0.15);

		for (let b = 0; b < numBranches && nodes.length < nodeCount; b++) {
			const theta = Math.random() * Math.PI * 2;
			const phi = Math.acos(2 * Math.random() - 1);
			const newDir = {
				x: Math.sin(phi) * Math.cos(theta),
				y: Math.sin(phi) * Math.sin(theta) * 0.7,
				z: Math.cos(phi),
			};
			branch(idx, newDir, nextLength, depth + 1);
		}
	}

	const mainDirs = [
		{ x: 1, y: 0.3, z: 0.2 },
		{ x: -0.8, y: 0.5, z: -0.3 },
		{ x: 0.2, y: -0.9, z: 0.4 },
		{ x: -0.3, y: 0.2, z: 1 },
		{ x: 0.5, y: 0.7, z: -0.8 },
	];

	for (const dir of mainDirs) {
		if (nodes.length >= nodeCount) break;
		branch(0, dir, 250 + Math.random() * 60, 0);
	}

	return { nodes, connections };
}

function projectNode(
	node: Node3D,
	rotY: number,
	rotX: number,
	w: number,
	h: number,
): { sx: number; sy: number; depth: number } {
	const x = node.x * Math.cos(rotY) - node.z * Math.sin(rotY);
	let z = node.x * Math.sin(rotY) + node.z * Math.cos(rotY);
	let y = node.y;
	const y2 = y * Math.cos(rotX) - z * Math.sin(rotX);
	const z2 = y * Math.sin(rotX) + z * Math.cos(rotX);
	y = y2;
	z = z2;
	const fov = 800;
	const perspective = fov / (fov + z + 500);
	// Scale projection to fit the canvas — use smaller dimension to avoid clipping
	const fit = Math.min(w, h) / 700;
	return {
		sx: w / 2 + x * perspective * fit,
		sy: h / 2 + y * perspective * fit,
		depth: z,
	};
}

// Colors — resolved once, used for all nodes
const SAFE_RGB = "56, 137, 46"; // --color-safe #38892e
const CRITICAL_RGB = "196, 48, 48"; // --color-critical #c43030

function NetworkVisual() {
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

		const isMobile = window.innerWidth < 768;
		const count = isMobile ? NODE_COUNT_MOBILE : NODE_COUNT_DESKTOP;
		const mesh = buildMesh(count);
		if (isMobile) {
			for (const n of mesh.nodes) n.r *= 0.65;
		}
		// Recenter around centroid
		const cx = mesh.nodes.reduce((s, n) => s + n.x, 0) / mesh.nodes.length;
		const cy = mesh.nodes.reduce((s, n) => s + n.y, 0) / mesh.nodes.length;
		const cz = mesh.nodes.reduce((s, n) => s + n.z, 0) / mesh.nodes.length;
		const nodes = mesh.nodes.map((n) => ({
			...n,
			x: n.x - cx,
			y: n.y - cy,
			z: n.z - cz,
		}));
		const connections = mesh.connections;

		const pulses = connections.map(() => ({
			offset: Math.random(),
			speed: 0.003 + Math.random() * 0.005,
			active: Math.random() > 0.4,
		}));

		let animId: number;
		let time = 0;
		let isVisible = true;
		const prefersReduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;

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
			time += 0.002;
			ctx.clearRect(0, 0, w, h);

			const rotY = prefersReduced ? 0.3 : Math.sin(time * 0.4) * 0.35;
			const rotX = 0.2;

			const projected = nodes.map((n) => projectNode(n, rotY, rotX, w, h));

			// Draw connections
			for (let ci = 0; ci < connections.length; ci++) {
				const [a, b] = connections[ci];
				const pa = projected[a];
				const pb = projected[b];
				const nodeB = nodes[b];

				const avgDepth = (pa.depth + pb.depth) / 2;
				const depthAlpha = Math.max(
					0.03,
					Math.min(0.18, (avgDepth + 400) / 1600),
				);

				const rgb = nodeB.safe ? SAFE_RGB : CRITICAL_RGB;

				// Base line
				ctx.beginPath();
				ctx.moveTo(pa.sx, pa.sy);
				ctx.lineTo(pb.sx, pb.sy);
				ctx.strokeStyle = `rgba(${rgb}, ${depthAlpha})`;
				ctx.lineWidth = 0.6;
				ctx.stroke();

				// Traveling pulse
				const pulse = pulses[ci];
				if (pulse.active) {
					pulse.offset += pulse.speed;
					if (pulse.offset > 1.3) {
						pulse.offset = -0.3;
						pulse.active = Math.random() > 0.25;
					}

					const streakLen = 0.25;
					const t0 = Math.max(0, pulse.offset - streakLen);
					const t1 = Math.min(1, pulse.offset);

					if (t1 > 0 && t0 < 1) {
						const x0 = pa.sx + (pb.sx - pa.sx) * t0;
						const y0 = pa.sy + (pb.sy - pa.sy) * t0;
						const x1 = pa.sx + (pb.sx - pa.sx) * t1;
						const y1 = pa.sy + (pb.sy - pa.sy) * t1;

						const grad = ctx.createLinearGradient(x0, y0, x1, y1);
						grad.addColorStop(0, `rgba(${rgb}, 0)`);
						grad.addColorStop(0.5, `rgba(${rgb}, ${depthAlpha * 4})`);
						grad.addColorStop(1, `rgba(${rgb}, 0)`);

						ctx.beginPath();
						ctx.moveTo(x0, y0);
						ctx.lineTo(x1, y1);
						ctx.strokeStyle = grad;
						ctx.lineWidth = 1.2;
						ctx.stroke();
					}
				} else if (Math.random() < 0.002) {
					pulse.active = true;
					pulse.offset = -0.1;
				}
			}

			// Draw nodes sorted by depth (far first)
			const sortedIndices = projected
				.map((p, i) => ({ i, depth: p.depth }))
				.sort((a, b) => a.depth - b.depth)
				.map((e) => e.i);

			for (const i of sortedIndices) {
				const p = projected[i];
				const node = nodes[i];

				const depthFactor = (p.depth + 400) / 800;
				const alpha = Math.max(0.25, Math.min(1, depthFactor * 1.1));
				const r = node.r * Math.max(0.5, depthFactor);

				if (node.hub) {
					// Hub — large white dot with wide glow
					const glow = ctx.createRadialGradient(
						p.sx,
						p.sy,
						0,
						p.sx,
						p.sy,
						r * 8,
					);
					glow.addColorStop(0, "rgba(255, 255, 255, 0.3)");
					glow.addColorStop(0.5, "rgba(255, 255, 255, 0.06)");
					glow.addColorStop(1, "rgba(255, 255, 255, 0)");
					ctx.beginPath();
					ctx.arc(p.sx, p.sy, r * 8, 0, Math.PI * 2);
					ctx.fillStyle = glow;
					ctx.fill();

					ctx.beginPath();
					ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
					ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
					ctx.fill();
				} else {
					const rgb = node.safe ? SAFE_RGB : CRITICAL_RGB;

					// Outer glow
					const glow = ctx.createRadialGradient(
						p.sx,
						p.sy,
						0,
						p.sx,
						p.sy,
						r * 5,
					);
					glow.addColorStop(0, `rgba(${rgb}, ${alpha * 0.25})`);
					glow.addColorStop(1, `rgba(${rgb}, 0)`);
					ctx.beginPath();
					ctx.arc(p.sx, p.sy, r * 5, 0, Math.PI * 2);
					ctx.fillStyle = glow;
					ctx.fill();

					// Core dot
					ctx.beginPath();
					ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
					ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
					ctx.fill();
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
		<div ref={containerRef} className="w-full aspect-square" aria-hidden="true">
			<canvas ref={canvasRef} className="w-full h-full" />
		</div>
	);
}

// Zig-zag node positions as fractions of canvas (x%, y%)
const CHAIN_NODES = [
	{ xPct: 0.35, yPct: 0.12, label: "Nonce Created" },
	{ xPct: 0.72, yPct: 0.25, label: "9 Days Dormant" },
	{ xPct: 0.2, yPct: 0.45, label: "Execution Attempted" },
	{ xPct: 0.72, yPct: 0.55, label: "Attacker" },
	{ xPct: 0.4, yPct: 0.75, label: "BLOCKED" },
];

function TimelineVisual() {
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
		// Main chain: 0→1→2→4   Attacker branch: 3→2
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

		// Attacker branch signal (separate, red pulse from 3→2)
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

				// Attacker pulse (red, from node 3 → node 2)
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

const SCORE = 73;
const SCORE_LABEL = "LOW RISK";
const SCORE_RGB = "56, 137, 46"; // --color-safe
const TICK_COUNT = 60;
// The arc spans 270° (from 135° to 405°), leaving a gap at the bottom
const ARC_START = (Math.PI * 3) / 4; // 135°
const ARC_SWEEP = (Math.PI * 3) / 2; // 270°
const ARC_END = ARC_START + ARC_SWEEP;
const SCORE_ANGLE = ARC_START + (SCORE / 100) * ARC_SWEEP;

function ScoringVisual() {
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

		// Animate the green arc from 0 → score angle
		let progress = prefersReduced ? 1 : 0; // 0→1
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

			// Green filled arc (0 → current score)
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

		draw();
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

export function FeatureVisual({ variant }: FeatureVisualProps) {
	return (
		<div className="flex items-center justify-center p-6">
			{variant === "gauge" && <ScoringVisual />}
			{variant === "network" && <NetworkVisual />}
			{variant === "timeline" && <TimelineVisual />}
		</div>
	);
}
