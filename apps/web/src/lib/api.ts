const API_BASE =
	process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

type ApiResponse<T> = {
	message: string;
	data: T;
};

export type MultisigResponse = {
	id: string;
	address: string;
	label: string | null;
	threshold: number | null;
	configAuthority: string | null;
	vaults: Array<{ vaultIndex: number; pda: string }>;
	createdAt: string;
};

export type SignerResponse = {
	id: string;
	address: string;
	permissions: {
		mask: number;
		initiate: boolean;
		vote: boolean;
		execute: boolean;
	};
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
	instructions: Array<{
		instructionIndex: number;
		programId: string;
		data: string;
		accounts: string[];
	}>;
};

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

export async function getMultisig(address: string): Promise<MultisigResponse> {
	return apiFetch<MultisigResponse>(`/multisigs/${address}`);
}

export async function getSigners(address: string): Promise<SignerResponse[]> {
	return apiFetch<SignerResponse[]>(`/multisigs/${address}/signers`);
}

export async function getProposals(
	address: string,
): Promise<ProposalResponse[]> {
	return apiFetch<ProposalResponse[]>(`/multisigs/${address}/proposals`);
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
