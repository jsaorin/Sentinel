export type ApiResponse<T> = {
	data: T;
	message?: string;
};

export type ApiError = {
	error: string;
	statusCode: number;
};

export type PaginatedResponse<T> = {
	data: T[];
	total: number;
	page: number;
	pageSize: number;
};
