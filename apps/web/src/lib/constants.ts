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
export const STATUS_DISPLAY: Record<
	string,
	"Pending" | "Executed" | "Rejected"
> = {
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
export const STATUS_DISPLAY_VARIANT: Record<
	string,
	"medium" | "safe" | "critical"
> = {
	Pending: "medium",
	Executed: "safe",
	Rejected: "critical",
};

/* ── Warning / flag severity ─────────────────────────────── */

export const WARNING_SEVERITY: Record<
	string,
	"critical" | "high" | "medium" | "low"
> = {
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

export const RECOMMENDATION_VARIANT: Record<
	string,
	"critical" | "high" | "medium" | "low" | "info"
> = {
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

export const PROPOSAL_STATUSES = [
	"All",
	"Pending",
	"Executed",
	"Rejected",
] as const;

/* ── Threat Signal: Severity ─────────────────────────────── */

export const SEVERITY_LABEL: Record<string, string> = {
	low: "Low",
	medium: "Medium",
	high: "High",
};

export const SEVERITY_VARIANT: Record<string, "low" | "medium" | "high"> = {
	low: "low",
	medium: "medium",
	high: "high",
};

/* ── Threat Signal: Category ─────────────────────────────── */

export const CATEGORY_LABEL: Record<string, string> = {
	phishing: "Phishing",
	rugpull: "Rug Pull",
	exploit: "Exploit",
	compromised_key: "Compromised Key",
	other: "Other",
};

/* ── Threat Signal: Source Kind ────────────────────────────── */

export const SOURCE_KIND_LABEL: Record<string, string> = {
	telegram: "Telegram",
	twitter: "Twitter",
	rss: "RSS",
};

/* ── Threat Signal: Affected Entities ──────────────────────── */

export const ENTITY_KIND_LABEL: Record<string, string> = {
	program: "Program",
	multisig: "Multisig",
	wallet: "Wallet",
};

export const ENTITY_ROLE_LABEL: Record<string, string> = {
	attacker: "Attacker",
	victim: "Victim",
	compromised: "Compromised",
	vulnerable: "Vulnerable",
	unknown: "Unknown",
};

export const ENTITY_ROLE_VARIANT: Record<
	string,
	"critical" | "high" | "medium" | "info" | "unknown"
> = {
	attacker: "critical",
	victim: "high",
	compromised: "high",
	vulnerable: "medium",
	unknown: "unknown",
};

/* ── Threat Signal: Filters ───────────────────────────────── */

export const THREAT_SOURCE_FILTERS = [
	"All",
	"Telegram",
	"Twitter",
	"RSS",
] as const;

export const THREAT_SEVERITY_FILTERS = [
	"All",
	"High",
	"Medium",
	"Low",
] as const;

/* ── Pagination ──────────────────────────────────────────── */

export const PAGE_SIZE = 10;

/* ── Solana ──────────────────────────────────────────────── */

export const SOLANA_ADDRESS_RE = /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/g;

export const SOL_LOGO =
	"https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png";

export const SOLSCAN_BASE = "https://solscan.io/account";
