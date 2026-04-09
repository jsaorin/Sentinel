"use client";

import { useEffect, useRef } from "react";

type Node3D = { x: number; y: number; z: number; r: number };

function createNodes(): Node3D[] {
  const nodes: Node3D[] = [];
  // Dense neural cloud spread across a large volume
  for (let i = 0; i < 60; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = 120 + Math.random() * 320;
    nodes.push({
      x: radius * Math.sin(phi) * Math.cos(theta),
      y: radius * Math.sin(phi) * Math.sin(theta) * 0.7,
      z: radius * Math.cos(phi),
      r: 1.5 + Math.random() * 3,
    });
  }
  return nodes;
}

function getConnections(nodes: Node3D[]): Array<[number, number]> {
  const connections: Array<[number, number]> = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dz = nodes[i].z - nodes[j].z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < 180) {
        connections.push([i, j]);
      }
    }
  }
  return connections;
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
  const fov = 600;
  const scale = fov / (fov + z + 300);
  return {
    sx: w / 2 + x * scale,
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

    const nodes = createNodes();
    const connections = getConnections(nodes);

    // Pulse state — each connection has a traveling pulse
    const pulses = connections.map(() => ({
      offset: Math.random(), // 0-1 position along the line
      speed: 0.003 + Math.random() * 0.005,
      active: Math.random() > 0.4,
    }));

    let animId: number;
    let time = 0;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    function draw() {
      if (!ctx) return;
      time += 0.004;
      ctx.clearRect(0, 0, w, h);

      const rotY = prefersReduced ? 0.3 : time * 0.3;
      const rotX = 0.25;

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
          Math.min(0.18, (avgDepth + 350) / 1500),
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

        const depthFactor = (p.depth + 350) / 700;
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
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 lg:relative lg:inset-auto flex items-center justify-center w-full h-full lg:min-h-[600px] opacity-30 lg:opacity-100"
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
