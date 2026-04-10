"use client";

import { useEffect, useState } from "react";

type ScoreGaugeProps = {
  score: number;
  size?: "sm" | "md" | "lg";
};

type RiskLevel = "critical" | "high" | "medium" | "low" | "safe";

function getLevel(score: number): RiskLevel {
  if (score < 20) return "critical";
  if (score < 40) return "high";
  if (score < 60) return "medium";
  if (score < 80) return "low";
  return "safe";
}

const levelLabels: Record<RiskLevel, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  safe: "Safe",
};

const levelColors: Record<RiskLevel, string> = {
  critical: "#c43030",
  high: "#d4952a",
  medium: "#b89a30",
  low: "#4da035",
  safe: "#38892e",
};

const RADIUS = 120;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const ARC_LENGTH = CIRCUMFERENCE * 0.75;

const sizeClasses = {
  sm: "max-w-[160px]",
  md: "max-w-[200px]",
  lg: "max-w-[240px]",
};

const fontSizes = {
  sm: 40,
  md: 50,
  lg: 60,
};

const labelSizes = {
  sm: 11,
  md: 13,
  lg: 14,
};

export function ScoreGauge({ score, size = "md" }: ScoreGaugeProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const level = getLevel(clamped);
  const color = levelColors[level];

  const targetOffset = ARC_LENGTH * ((100 - clamped) / 100);
  const [currentOffset, setCurrentOffset] = useState(ARC_LENGTH);

  useEffect(() => {
    const timeout = setTimeout(() => setCurrentOffset(targetOffset), 100);
    return () => clearTimeout(timeout);
  }, [targetOffset]);

  return (
    <svg
      viewBox="0 0 300 300"
      className={`w-full ${sizeClasses[size]}`}
      aria-label={`Security score: ${clamped} out of 100, ${levelLabels[level]}`}
      role="meter"
    >
      <circle
        cx="150"
        cy="150"
        r={RADIUS}
        fill="none"
        stroke="#222222"
        strokeWidth="14"
        strokeDasharray={`${ARC_LENGTH} ${CIRCUMFERENCE}`}
        strokeDashoffset={0}
        strokeLinecap="round"
        transform="rotate(135, 150, 150)"
      />
      <circle
        cx="150"
        cy="150"
        r={RADIUS}
        fill="none"
        stroke={color}
        strokeWidth="14"
        strokeDasharray={`${ARC_LENGTH} ${CIRCUMFERENCE}`}
        strokeDashoffset={currentOffset}
        strokeLinecap="round"
        transform="rotate(135, 150, 150)"
        style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
      />
      <text
        x="150"
        y="148"
        textAnchor="middle"
        className="font-display"
        fill={color}
        fontSize={fontSizes[size]}
        fontWeight="700"
      >
        {clamped}
      </text>
      <text
        x="150"
        y="185"
        textAnchor="middle"
        fill="#e0e0e0"
        fontSize={labelSizes[size]}
        fontWeight="600"
        letterSpacing="0.1em"
      >
        {levelLabels[level].toUpperCase()} RISK
      </text>
    </svg>
  );
}
