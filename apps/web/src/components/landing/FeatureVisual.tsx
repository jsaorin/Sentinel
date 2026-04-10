"use client";

import { useEffect, useRef } from "react";
import { ScoreGauge } from "@sentinel/ui";

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

const NODE_COUNT = 300;
// ~25% of nodes are "critical" (red), the rest are "safe" (green)
const CRITICAL_RATIO = 0.25;

function buildMesh(): MeshResult {
  const nodes: Node3D[] = [];
  const connections: Array<[number, number]> = [];

  nodes.push({ x: 0, y: 0, z: 0, r: 12, safe: true, hub: true });

  function branch(
    parentIdx: number,
    dir: { x: number; y: number; z: number },
    length: number,
    depth: number,
  ) {
    if (depth > 5 || nodes.length >= NODE_COUNT) return;

    const parent = nodes[parentIdx];
    const jitter = length * 0.3;
    const node: Node3D = {
      x: parent.x + dir.x * length + (Math.random() - 0.5) * jitter,
      y: parent.y + dir.y * length + (Math.random() - 0.5) * jitter,
      z: parent.z + dir.z * length + (Math.random() - 0.5) * jitter,
      r: Math.max(1, 2.5 - depth * 0.3),
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

    for (let b = 0; b < numBranches && nodes.length < NODE_COUNT; b++) {
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
    if (nodes.length >= NODE_COUNT) break;
    branch(0, dir, 120 + Math.random() * 40, 0);
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
  const fov = 500;
  const scale = fov / (fov + z + 300);
  return { sx: w / 2 + x * scale, sy: h / 2 + y * scale, depth: z };
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

    const mesh = buildMesh();
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
    <div
      ref={containerRef}
      className="w-full aspect-square max-w-xs mx-auto"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}

function TimelineVisual() {
  const steps = [
    { x: 30, label: "Nonce\nCreated", color: "var(--color-info)" },
    { x: 110, label: "9 Days\nDormant", color: "var(--color-medium)" },
    { x: 190, label: "Execution\nAttempted", color: "var(--color-high)" },
    { x: 270, label: "BLOCKED", color: "var(--color-critical)" },
  ];

  return (
    <svg
      viewBox="0 0 300 160"
      className="w-full max-w-sm mx-auto"
      aria-hidden="true"
    >
      {/* Track line */}
      <line
        x1="30"
        y1="60"
        x2="270"
        y2="60"
        stroke="var(--color-bg-overlay)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Animated fill line */}
      <line
        x1="30"
        y1="60"
        x2="270"
        y2="60"
        stroke="var(--color-primary)"
        strokeWidth="3"
        strokeLinecap="round"
        className="animate-timeline-draw"
      />

      {steps.map((step, i) => (
        <g key={`step-${step.x}`}>
          <circle
            cx={step.x}
            cy="60"
            r="8"
            fill="var(--color-bg-card)"
            stroke={step.color}
            strokeWidth="2.5"
            className={i === 3 ? "animate-pulse-critical" : ""}
            style={{ animationDelay: `${i * 0.5}s` }}
          />
          {step.label.split("\n").map((line, li) => (
            <text
              key={`t-${step.x}-${li}`}
              x={step.x}
              y={95 + li * 16}
              textAnchor="middle"
              fill={i === 3 ? step.color : "var(--color-text-secondary)"}
              fontSize="11"
              fontWeight={i === 3 ? "700" : "500"}
            >
              {line}
            </text>
          ))}
        </g>
      ))}
    </svg>
  );
}

export function FeatureVisual({ variant }: FeatureVisualProps) {
  return (
    <div className="flex items-center justify-center p-6">
      {variant === "gauge" && <ScoreGauge score={73} size="lg" />}
      {variant === "network" && <NetworkVisual />}
      {variant === "timeline" && <TimelineVisual />}
    </div>
  );
}
