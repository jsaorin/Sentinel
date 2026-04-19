import type { RiskLevel } from "@/lib/risk";

/* ── Environment ─────────────────────────────────────────── */

export const IS_DEV = process.env.NODE_ENV === "development";

/* ── Proposal status → display label ─────────────────────── */

export const STATUS_LABEL: Record<string, string> = {
	DRAFT: "Draft",
	ACTIVE: "Active",
	APPROVED: "Approved",
	REJECTED: "Rejected",
	EXECUTED: "Executed",
	CANCELLED: "Cancelled",
};

/** Maps raw API status to the 3 simplified statuses used in tables. */
export const STATUS_DISPLAY: Record<string, "Pending" | "Executed" | "Rejected"> = {
	DRAFT: "Pending",
	ACTIVE: "Pending",
	APPROVED: "Pending",
	REJECTED: "Rejected",
	EXECUTED: "Executed",
	CANCELLED: "Rejected",
};

/** Maps raw API status to Badge variant colors. */
export const STATUS_VARIANT: Record<string, "medium" | "safe" | "critical"> = {
	DRAFT: "medium",
	ACTIVE: "medium",
	APPROVED: "medium",
	REJECTED: "critical",
	EXECUTED: "safe",
	CANCELLED: "critical",
};

/** Maps simplified display status to Badge variant colors. */
export const STATUS_DISPLAY_VARIANT: Record<string, "medium" | "safe" | "critical"> = {
	Pending: "medium",
	Executed: "safe",
	Rejected: "critical",
};

/* ── Warning / flag severity ─────────────────────────────── */

export const WARNING_SEVERITY: Record<string, "critical" | "high" | "medium" | "low"> = {
	CRITICAL_THRESHOLD_ONE: "critical",
	LOW_THRESHOLD: "high",
	EXTERNAL_CONFIG_AUTHORITY: "high",
	CONCENTRATED_SIGNER: "medium",
	LOW_SIGNER_COUNT: "medium",
};

export const FLAG_SEVERITY_LEVEL: Record<string, RiskLevel> = {
	LOW: "low",
	MEDIUM: "medium",
	HIGH: "high",
	CRITICAL: "critical",
};

/* ── AI recommendation ───────────────────────────────────── */

export const RECOMMENDATION_VARIANT: Record<string, "critical" | "high" | "medium" | "low" | "info"> = {
	SIGN: "low",
	VERIFY: "medium",
	DO_NOT_SIGN: "critical",
};

export const RECOMMENDATION_LABEL: Record<string, string> = {
	SIGN: "Safe to Sign",
	VERIFY: "Verify Before Signing",
	DO_NOT_SIGN: "Do Not Sign",
};

/* ── Filters ─────────────────────────────────────────────── */

export const RISK_FILTERS = [
	"All",
	"Critical",
	"High",
	"Medium",
	"Low",
	"Safe",
] as const;

export const PROPOSAL_STATUSES = ["All", "Pending", "Executed", "Rejected"] as const;

/* ── Pagination ──────────────────────────────────────────── */

export const PAGE_SIZE = 10;

/* ── Solana ──────────────────────────────────────────────── */

export const SOLANA_ADDRESS_RE = /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/g;

export const SOL_LOGO =
	"https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png";

export const SOLSCAN_BASE = "https://solscan.io/account";
