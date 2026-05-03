export class NonceAccount {
	public readonly id: string;
	public readonly address: string;
	public readonly authority: string;
	public readonly fundedBy: string | null;
	public readonly multisigId: string;
	public readonly signerId: string;
	public readonly externallyFunded: boolean;
	public readonly detectedAt: Date;
	public readonly createdAt: Date;
	public readonly updatedAt: Date;

	constructor(params: {
		id: string;
		address: string;
		authority: string;
		fundedBy: string | null;
		multisigId: string;
		signerId: string;
		externallyFunded: boolean;
		detectedAt: Date;
		createdAt: Date;
		updatedAt: Date;
	}) {
		this.id = params.id;
		this.address = params.address;
		this.authority = params.authority;
		this.fundedBy = params.fundedBy;
		this.multisigId = params.multisigId;
		this.signerId = params.signerId;
		this.externallyFunded = params.externallyFunded;
		this.detectedAt = params.detectedAt;
		this.createdAt = params.createdAt;
		this.updatedAt = params.updatedAt;
	}
}
