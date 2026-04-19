export type RiskLevel =
	| "critical"
	| "high"
	| "medium"
	| "low"
	| "safe"
	| "info"
	| "unknown";

/** Map a health score (0–100, higher = safer) to a risk level. */
export function getLevel(score: number): RiskLevel {
	if (score < 20) return "critical";
	if (score < 40) return "high";
	if (score < 60) return "medium";
	if (score < 80) return "low";
	return "safe";
}

/** Map a proposal risk score (0–100, higher = riskier) to a risk level. */
export function getRiskLevel(score: number): RiskLevel {
	if (score <= 20) return "safe";
	if (score <= 40) return "low";
	if (score <= 60) return "medium";
	if (score <= 80) return "high";
	return "critical";
}

export const LEVEL_LABELS: Record<RiskLevel, string> = {
	critical: "CRITICAL",
	high: "HIGH RISK",
	medium: "MEDIUM RISK",
	low: "LOW RISK",
	safe: "SAFE",
	info: "INFO",
	unknown: "UNKNOWN",
};

export const LEVEL_RGB: Record<RiskLevel, string> = {
	critical: "196, 48, 48",
	high: "212, 149, 42",
	medium: "184, 154, 48",
	low: "77, 160, 53",
	safe: "56, 137, 46",
	info: "44, 90, 144",
	unknown: "74, 78, 85",
};

export const LEVEL_HEX: Record<RiskLevel, string> = {
	critical: "#c43030",
	high: "#d4952a",
	medium: "#b89a30",
	low: "#4da035",
	safe: "#38892e",
	info: "#2C5A90",
	unknown: "#4A4E55",
};
