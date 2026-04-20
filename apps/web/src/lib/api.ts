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
