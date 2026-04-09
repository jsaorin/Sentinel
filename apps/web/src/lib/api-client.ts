const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type FetchOptions = Omit<RequestInit, "body"> & {
	body?: unknown;
};

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
	const { body, ...rest } = options;
	const response = await fetch(`${API_BASE_URL}${path}`, {
		...rest,
		headers: {
			"Content-Type": "application/json",
			...rest.headers,
		},
		body: body !== undefined ? JSON.stringify(body) : undefined,
	});

	if (!response.ok) {
		throw new Error(`API error ${response.status}: ${response.statusText}`);
	}

	return response.json() as Promise<T>;
}

export const apiClient = {
	get: <T>(path: string, init?: RequestInit) => apiFetch<T>(path, { ...init, method: "GET" }),
	post: <T>(path: string, body: unknown, init?: RequestInit) =>
		apiFetch<T>(path, { ...init, method: "POST", body }),
	put: <T>(path: string, body: unknown, init?: RequestInit) =>
		apiFetch<T>(path, { ...init, method: "PUT", body }),
	delete: <T>(path: string, init?: RequestInit) =>
		apiFetch<T>(path, { ...init, method: "DELETE" }),
};
