type ScoreDisplayProps = {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animated?: boolean;
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

const levelTextColors: Record<RiskLevel, string> = {
  critical: "text-critical",
  high: "text-high",
  medium: "text-medium",
  low: "text-low",
  safe: "text-safe",
};

const sizeClasses = {
  sm: "text-3xl",
  md: "text-5xl",
  lg: "text-6xl",
};

const labelSizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-md",
};

export function ScoreDisplay({
  score,
  size = "md",
  showLabel = true,
  animated = true,
}: ScoreDisplayProps) {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const level = getLevel(clampedScore);
  const isCritical = animated && clampedScore < 30;

  return (
    <div
      className={[
        "inline-flex flex-col items-center gap-3",
        isCritical ? "animate-pulse-critical rounded-xl p-3" : "",
      ].join(" ")}
      aria-label={`Security score: ${clampedScore} out of 100, ${levelLabels[level]}`}
      role="meter"
      aria-valuenow={clampedScore}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span
        className={[
          "font-mono font-bold leading-none tabular-nums",
          sizeClasses[size],
          levelTextColors[level],
        ].join(" ")}
      >
        {clampedScore}
      </span>
      {showLabel && (
        <span
          className={[
            "font-semibold tracking-wider uppercase",
            labelSizeClasses[size],
            levelTextColors[level],
          ].join(" ")}
        >
          {levelLabels[level]}
        </span>
      )}
    </div>
  );
}
