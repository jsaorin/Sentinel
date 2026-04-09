"use client";

import { ScoreGauge } from "@sentinel/ui";

type FeatureVisualProps = {
  variant: "gauge" | "network" | "timeline";
};

function NetworkVisual() {
  // Center hub
  const hub = { cx: 150, cy: 155 };

  // Outer signer nodes — only connect to hub, not to each other
  const signers = [
    { cx: 150, cy: 40, color: "var(--color-safe)", label: "S1", delay: 0 },
    { cx: 45, cy: 120, color: "var(--color-safe)", label: "S2", delay: 0.8 },
    {
      cx: 255,
      cy: 120,
      color: "var(--color-critical)",
      label: "S3",
      delay: 1.6,
    },
    { cx: 80, cy: 265, color: "var(--color-info)", label: "S4", delay: 2.4 },
    { cx: 220, cy: 265, color: "var(--color-safe)", label: "S5", delay: 0.4 },
  ];

  return (
    <svg
      viewBox="0 0 300 310"
      className="w-full max-w-xs mx-auto"
      aria-hidden="true"
    >
      {signers.map((s) => (
        <g key={`conn-${s.label}`}>
          <line
            x1={s.cx}
            y1={s.cy}
            x2={hub.cx}
            y2={hub.cy}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1.5"
          />

          <line
            x1={s.cx}
            y1={s.cy}
            x2={hub.cx}
            y2={hub.cy}
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="2"
            strokeDasharray="15 300"
            className="animate-neural-pulse"
            style={{ animationDelay: `${s.delay}s` }}
          />
        </g>
      ))}

      {/* Center hub node — soft radial glow + core */}
      <defs>
        <radialGradient id="hub-glow">
          <stop offset="40%" stopColor="rgba(255,255,255,0.25)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.06)" />
          <stop offset="200%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      <circle cx={hub.cx} cy={hub.cy} r="40" fill="url(#hub-glow)" />
      <circle cx={hub.cx} cy={hub.cy} r="8" fill="rgba(255,255,255,0.9)" />

      {/* Signer nodes */}
      {signers.map((s) => (
        <g key={`s-${s.label}`}>
          <circle
            cx={s.cx}
            cy={s.cy}
            r="22"
            fill="var(--color-bg-card)"
            stroke={s.color}
            strokeWidth="1.5"
          />
          <text
            x={s.cx}
            y={s.cy + 5}
            textAnchor="middle"
            fill={s.color}
            fontSize="12"
            fontWeight="600"
          >
            {s.label}
          </text>
        </g>
      ))}
    </svg>
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
