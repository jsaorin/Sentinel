const API_BASE =
	process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

type ApiResponse<T> = {
	message: string;
	data: T;
};

/* ── Shared sub-types ────────────────────────────────────── */

export type PermissionsResponse = {
	mask: number;
	initiate: boolean;
	vote: boolean;
	execute: boolean;
};

export type MultisigWarningResponse = {
	code: string;
	message: string;
};

export type MultisigScoreResponse = {
	overall: number;
	breakdown: {
		threshold: number;
		configAuthority: number;
		signerConcentration: number;
		signerCount: number;
	};
	warnings: MultisigWarningResponse[];
	aiSummary: string | null;
	calculatedAt: string;
};

export type ProposalFlagResponse = {
	type: string;
	severity: string;
	points: number;
	detail: string;
};

export type DecodedInstructionResponse = {
	instructionIndex: number;
	programId: string;
	programName: string;
	action: string;
	params: Record<string, string>;
	accounts: Array<{ address: string; label: string }>;
	rawData: string;
	isKnown: boolean;
};

export type ProposalSignerResponse = {
	address: string;
	permissions: PermissionsResponse;
	totalProposalsInMultisig: number;
};

/* ── Endpoint response types ─────────────────────────────── */

export type MultisigResponse = {
	id: string;
	address: string;
	label: string | null;
	threshold: number | null;
	configAuthority: string | null;
	totalSigners: number;
	vaults: Array<{ vaultIndex: number; pda: string }>;
	healthScore: MultisigScoreResponse | null;
	createdAt: string;
};

export type MultisigListItemResponse = {
	id: string;
	address: string;
	label: string | null;
	threshold: number | null;
	totalSigners: number;
	healthScore: number | null;
	activeProposals: number;
	lastActivity: string | null;
	createdAt: string;
};

export type SignerResponse = {
	id: string;
	address: string;
	permissions: PermissionsResponse;
};

export type ProposalResponse = {
	id: string;
	proposalIndex: number;
	transactionIndex: number;
	pda: string;
	transactionPda: string;
	status: string;
	creator: string | null;
	createdAt: string;
	executedAt: string | null;
	riskScore: number | null;
	summary: string | null;
	instructions: Array<{
		instructionIndex: number;
		programId: string;
		data: string;
		accounts: string[];
	}>;
};

export type ProposalDetailResponse = {
	id: string;
	proposalIndex: number;
	transactionIndex: number;
	status: string;
	creator: string | null;
	createdAt: string;
	executedAt: string | null;
	multisig: {
		address: string;
		label: string | null;
		threshold: number | null;
		totalSigners: number;
	};
	scoring: {
		riskScore: number;
		flags: ProposalFlagResponse[];
		summary: string;
		calculatedAt: string;
	} | null;
	ai: {
		analysis: string;
		recommendation: string;
	} | null;
	signers: ProposalSignerResponse[];
	instructions: DecodedInstructionResponse[];
};

/* ── Threat signal types ────────────────────────────────── */

export type ThreatSignalListItemResponse = {
	id: string;
	sourceKind: "telegram" | "twitter" | "rss";
	sourceLabel: string | null;
	sourceUrl: string | null;
	severity: "low" | "medium" | "high" | null;
	category:
		| "phishing"
		| "rugpull"
		| "exploit"
		| "compromised_key"
		| "other"
		| null;
	summary: string | null;
	isThreat: boolean | null;
	capturedAt: string;
	analyzedAt: string | null;
};

export type PaginatedThreatSignalsResponse = {
	items: ThreatSignalListItemResponse[];
	pagination: PaginationResponse;
};

export type ThreatSignalQueryParams = {
	page?: number;
	pageSize?: number;
	sourceKind?: "telegram" | "twitter" | "rss";
	isThreat?: boolean;
	sortBy?: "capturedAt" | "createdAt";
	sortOrder?: "asc" | "desc";
};

/* ── Fetch helper ────────────────────────────────────────── */

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
	const res = await fetch(`${API_BASE}${path}`, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...options?.headers,
		},
	});
	if (!res.ok) {
		throw new Error(`API error: ${res.status}`);
	}

	const json: ApiResponse<T> = await res.json();
	return json.data;
}

/* ── API functions ───────────────────────────────────────── */

export async function getMultisigList(): Promise<MultisigListItemResponse[]> {
	return apiFetch<MultisigListItemResponse[]>("/multisigs");
}

export async function getMultisig(address: string): Promise<MultisigResponse> {
	return apiFetch<MultisigResponse>(`/multisigs/${address}`);
}

export async function getSigners(address: string): Promise<SignerResponse[]> {
	return apiFetch<SignerResponse[]>(`/multisigs/${address}/signers`);
}

export type PaginationResponse = {
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
};

export type PaginatedProposalsResponse = {
	proposals: ProposalResponse[];
	pagination: PaginationResponse;
};

export async function getProposals(
	address: string,
	page?: number,
	pageSize?: number,
): Promise<PaginatedProposalsResponse> {
	const params = new URLSearchParams();
	if (page != null) params.set("page", String(page));
	if (pageSize != null) params.set("pageSize", String(pageSize));
	const qs = params.toString();
	return apiFetch<PaginatedProposalsResponse>(
		`/multisigs/${address}/proposals${qs ? `?${qs}` : ""}`,
	);
}

export async function getProposalDetail(
	id: string,
): Promise<ProposalDetailResponse> {
	return apiFetch<ProposalDetailResponse>(`/proposals/${id}`);
}

/* ── Global proposals (all multisigs) ─────────────────── */

export type GlobalProposalResponse = {
	id: string;
	proposalIndex: number;
	transactionIndex: number;
	pda: string;
	transactionPda: string;
	status: string;
	creator: string | null;
	createdAt: string;
	executedAt: string | null;
	riskScore: number | null;
	summary: string | null;
	multisig: {
		address: string;
		label: string | null;
	};
};

export type PaginatedGlobalProposalsResponse = {
	proposals: GlobalProposalResponse[];
	pagination: PaginationResponse;
};

export async function getAllProposals(
	page = 1,
	pageSize = 10,
): Promise<PaginatedGlobalProposalsResponse> {
	const params = new URLSearchParams();
	params.set("page", String(page));
	params.set("pageSize", String(pageSize));
	return apiFetch<PaginatedGlobalProposalsResponse>(
		`/proposals?${params.toString()}`,
	);
}

/* ── Threat signals ─────────────────────────────────────── */

export async function getThreatSignals(
	params: ThreatSignalQueryParams = {},
): Promise<PaginatedThreatSignalsResponse> {
	const qs = new URLSearchParams();
	if (params.page != null) qs.set("page", String(params.page));
	if (params.pageSize != null) qs.set("pageSize", String(params.pageSize));
	if (params.sourceKind) qs.set("sourceKind", params.sourceKind);
	if (params.isThreat != null) qs.set("isThreat", String(params.isThreat));
	if (params.sortBy) qs.set("sortBy", params.sortBy);
	if (params.sortOrder) qs.set("sortOrder", params.sortOrder);
	const query = qs.toString();
	return apiFetch<PaginatedThreatSignalsResponse>(
		`/threat-signals${query ? `?${query}` : ""}`,
	);
}

export async function getThreatSignalById(
	id: string,
): Promise<ThreatSignalListItemResponse | null> {
	const result = await apiFetch<PaginatedThreatSignalsResponse>(
		"/threat-signals?pageSize=100",
	);
	return result.items.find((s) => s.id === id) ?? null;
}

/* ── Create multisig ───────────────────────────────────── */

export async function createMultisig(
	address: string,
	label?: string,
): Promise<{
	id: string;
	address: string;
	label: string | null;
	createdAt: string;
}> {
	return apiFetch("/multisigs", {
		method: "POST",
		body: JSON.stringify({ address, label }),
	});
}
