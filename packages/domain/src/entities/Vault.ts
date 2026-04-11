export class Vault {
	public readonly id: string;
	public readonly multisigId: string;
	public readonly vaultIndex: number;
	public readonly pda: string;
	public readonly createdAt: Date;
	public readonly updatedAt: Date;

	constructor(params: {
		id: string;
		multisigId: string;
		vaultIndex: number;
		pda: string;
		createdAt: Date;
		updatedAt: Date;
	}) {
		this.id = params.id;
		this.multisigId = params.multisigId;
		this.vaultIndex = params.vaultIndex;
		this.pda = params.pda;
		this.createdAt = params.createdAt;
		this.updatedAt = params.updatedAt;
	}
}
