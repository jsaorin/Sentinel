"use client";

import { useEffect, useRef } from "react";
import { LEVEL_RGB } from "@/lib/risk";

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

export function NetworkVisual() {
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

				const rgb = nodeB.safe ? LEVEL_RGB.safe : LEVEL_RGB.critical;

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
					const rgb = node.safe ? LEVEL_RGB.safe : LEVEL_RGB.critical;

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
