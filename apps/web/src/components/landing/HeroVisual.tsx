"use client";

import { useEffect, useRef } from "react";

type Node3D = { x: number; y: number; z: number; r: number };

type TreeResult = { nodes: Node3D[]; connections: Array<[number, number]> };

const nodesToDisplay = 1000;

function buildTree(): TreeResult {
  const nodes: Node3D[] = [];
  const connections: Array<[number, number]> = [];

  // Root node at center
  nodes.push({ x: 0, y: 0, z: 0, r: 3 });

  // Grow branches recursively
  function branch(
    parentIdx: number,
    dir: { x: number; y: number; z: number },
    length: number,
    depth: number,
  ) {
    if (depth > 5 || nodes.length >= nodesToDisplay) return;

    // Create node at end of branch
    const parent = nodes[parentIdx];
    const jitter = length * 0.3;
    const node: Node3D = {
      x: parent.x + dir.x * length + (Math.random() - 0.5) * jitter,
      y: parent.y + dir.y * length + (Math.random() - 0.5) * jitter,
      z: parent.z + dir.z * length + (Math.random() - 0.5) * jitter,
      r: Math.max(1.5, 3 - depth * 0.3),
    };
    const idx = nodes.length;
    nodes.push(node);
    connections.push([parentIdx, idx]);

    // Decide how many sub-branches (fewer as depth increases)
    const numBranches =
      depth < 2
        ? 3 + Math.floor(Math.random() * 2)
        : 1 + Math.floor(Math.random() * 2);
    const nextLength = length * (0.7 + Math.random() * 0.15);

    for (let b = 0; b < numBranches && nodes.length < nodesToDisplay; b++) {
      // Random direction biased away from parent
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

  // Start 5 main branches from root in spread directions
  const mainDirs = [
    { x: 1, y: 0.3, z: 0.2 },
    { x: -0.8, y: 0.5, z: -0.3 },
    { x: 0.2, y: -0.9, z: 0.4 },
    { x: -0.3, y: 0.2, z: 1 },
    { x: 0.5, y: 0.7, z: -0.8 },
  ];

  for (const dir of mainDirs) {
    if (nodes.length >= nodesToDisplay) break;
    branch(0, dir, 250 + Math.random() * 60, 0);
  }

  return { nodes, connections };
}

function project(
  node: Node3D,
  rotY: number,
  rotX: number,
  w: number,
  h: number,
): { sx: number; sy: number; depth: number } {
  // Rotate around Y axis
  const x = node.x * Math.cos(rotY) - node.z * Math.sin(rotY);
  let z = node.x * Math.sin(rotY) + node.z * Math.cos(rotY);
  let y = node.y;

  // Slight X rotation for perspective tilt
  const y2 = y * Math.cos(rotX) - z * Math.sin(rotX);
  const z2 = y * Math.sin(rotX) + z * Math.cos(rotX);
  y = y2;
  z = z2;

  // Perspective projection
  const fov = 900;
  const scale = fov / (fov + z + 500);
  return {
    sx: w * 0.7 + x * scale,
    sy: h / 2 + y * scale,
    depth: z,
  };
}

export function HeroVisual() {
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

    const tree = buildTree();
    // Recenter — shift all nodes so the centroid is at origin
    const cx = tree.nodes.reduce((s, n) => s + n.x, 0) / tree.nodes.length;
    const cy = tree.nodes.reduce((s, n) => s + n.y, 0) / tree.nodes.length;
    const cz = tree.nodes.reduce((s, n) => s + n.z, 0) / tree.nodes.length;
    const nodes = tree.nodes.map((n) => ({
      ...n,
      x: n.x - cx,
      y: n.y - cy,
      z: n.z - cz,
    }));
    const connections = tree.connections;

    // Pulse state — each connection has a traveling pulse
    const pulses = connections.map(() => ({
      offset: Math.random(), // 0-1 position along the line
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

      // Gentle oscillation — swings ±20° instead of full rotation
      const rotY = prefersReduced ? 0.3 : Math.sin(time * 0.4) * 0.35;
      const rotX = 0.2;

      // Project all nodes
      const projected = nodes.map((n) => project(n, rotY, rotX, w, h));

      // Draw connections
      for (let ci = 0; ci < connections.length; ci++) {
        const [a, b] = connections[ci];
        const pa = projected[a];
        const pb = projected[b];

        // Depth-based opacity
        const avgDepth = (pa.depth + pb.depth) / 2;
        const depthAlpha = Math.max(
          0.03,
          Math.min(0.18, (avgDepth + 600) / 2400),
        );

        // Base line
        ctx.beginPath();
        ctx.moveTo(pa.sx, pa.sy);
        ctx.lineTo(pb.sx, pb.sy);
        ctx.strokeStyle = `rgba(255, 255, 255, ${depthAlpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Traveling light streak along the connection
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
            grad.addColorStop(0, "rgba(255, 255, 255, 0)");
            grad.addColorStop(0.5, `rgba(255, 255, 255, ${depthAlpha * 4})`);
            grad.addColorStop(1, "rgba(255, 255, 255, 0)");

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

      // Draw nodes — sorted by depth (far first)
      const sortedIndices = projected
        .map((p, i) => ({ i, depth: p.depth }))
        .sort((a, b) => a.depth - b.depth)
        .map((e) => e.i);

      for (const i of sortedIndices) {
        const p = projected[i];
        const node = nodes[i];

        const depthFactor = (p.depth + 600) / 1200;
        const alpha = Math.max(0.25, Math.min(1, depthFactor * 1.1));
        const r = node.r * Math.max(0.5, depthFactor);

        // Outer glow
        const glow = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, r * 5);
        glow.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.25})`);
        glow.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, r * 5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
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
    <div
      ref={containerRef}
      className="absolute inset-0 flex items-center justify-center opacity-30 lg:opacity-100"
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
