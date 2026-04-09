type AlertLevel = "critical" | "high" | "medium" | "low" | "info";

type AlertBannerProps = {
	level: AlertLevel;
	title: string;
	description?: string;
	dismissible?: boolean;
	onDismiss?: () => void;
	action?: { label: string; onClick: () => void };
};

const levelConfig: Record<AlertLevel, { icon: string; bg: string; border: string; text: string }> =
	{
		critical: {
			icon: "⛔",
			bg: "bg-critical-subtle",
			border: "border-l-critical",
			text: "text-critical",
		},
		high: {
			icon: "⚠",
			bg: "bg-high-subtle",
			border: "border-l-high",
			text: "text-high",
		},
		medium: {
			icon: "●",
			bg: "bg-medium-subtle",
			border: "border-l-medium",
			text: "text-medium",
		},
		low: {
			icon: "✓",
			bg: "bg-low-subtle",
			border: "border-l-low",
			text: "text-low",
		},
		info: {
			icon: "ℹ",
			bg: "bg-info-subtle",
			border: "border-l-info",
			text: "text-info",
		},
	};

export function AlertBanner({
	level,
	title,
	description,
	dismissible = false,
	onDismiss,
	action,
}: AlertBannerProps) {
	const config = levelConfig[level];

	return (
		<div
			className={[
				"flex items-start gap-3 rounded-lg border-l-4 px-4 py-3",
				config.bg,
				config.border,
			].join(" ")}
			role="alert"
		>
			<span className={["text-lg shrink-0 mt-0.5", config.text].join(" ")} aria-hidden="true">
				{config.icon}
			</span>

			<div className="flex-1 min-w-0">
				<p className={["text-md font-semibold", config.text].join(" ")}>{title}</p>
				{description && (
					<p className="mt-1 text-base text-text-secondary">{description}</p>
				)}
				{action && (
					<button
						type="button"
						onClick={action.onClick}
						className={[
							"mt-2 text-sm font-semibold underline underline-offset-2",
							config.text,
						].join(" ")}
					>
						{action.label}
					</button>
				)}
			</div>

			{dismissible && onDismiss && (
				<button
					type="button"
					onClick={onDismiss}
					className="shrink-0 text-text-tertiary hover:text-text-primary transition-colors"
					aria-label="Dismiss alert"
				>
					✕
				</button>
			)}
		</div>
	);
}
