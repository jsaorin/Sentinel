type ProgressBarSize = "xs" | "sm" | "md";

type ProgressBarProps = {
	value: number;
	label?: string;
	showValue?: boolean;
	size?: ProgressBarSize;
	colorByValue?: boolean;
	color?: string;
};

type RiskLevel = "critical" | "high" | "medium" | "low" | "safe";

function getLevel(value: number): RiskLevel {
	if (value < 20) return "critical";
	if (value < 40) return "high";
	if (value < 60) return "medium";
	if (value < 80) return "low";
	return "safe";
}

const levelFillColors: Record<RiskLevel, string> = {
	critical: "bg-critical",
	high: "bg-high",
	medium: "bg-medium",
	low: "bg-low",
	safe: "bg-safe",
};

const trackSizeClasses: Record<ProgressBarSize, string> = {
	xs: "h-1",
	sm: "h-2",
	md: "h-3",
};

export function ProgressBar({
	value,
	label,
	showValue = false,
	size = "sm",
	colorByValue = true,
	color,
}: ProgressBarProps) {
	const clampedValue = Math.max(0, Math.min(100, Math.round(value)));
	const level = getLevel(clampedValue);
	const fillColor =
		color ?? (colorByValue ? levelFillColors[level] : "bg-primary");

	return (
		<div className="w-full">
			{(label || showValue) && (
				<div className="flex items-center justify-between mb-1.5">
					{label && (
						<span className="text-xs font-semibold tracking-wider uppercase text-text-secondary">
							{label}
						</span>
					)}
					{showValue && (
						<span className="text-sm font-mono tabular-nums text-text-primary">
							{clampedValue}%
						</span>
					)}
				</div>
			)}
			<div
				className={[
					"w-full rounded-full bg-bg-overlay overflow-hidden",
					trackSizeClasses[size],
				].join(" ")}
				role="progressbar"
				tabIndex={0}
				aria-valuenow={clampedValue}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-label={label ?? `Progress: ${clampedValue}%`}
			>
				<div
					className={[
						"h-full rounded-full transition-all duration-500 ease-out",
						fillColor,
					].join(" ")}
					style={{ width: `${clampedValue}%` }}
				/>
			</div>
		</div>
	);
}
