// biome-ignore lint/suspicious/noConfusingVoidType: void is intentional for handlers with no input
export type HealthCheckQueryInputDto = void;

export interface HealthCheckQueryOutputDto {
	status: string;
}
