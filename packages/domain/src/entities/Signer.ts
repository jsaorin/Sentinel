export class Signer {
	public readonly id: string;
	public readonly address: string;
	public readonly multisigId: string;
	public readonly permissions: { mask: number };
	public readonly createdAt: Date;
	public readonly updatedAt: Date;

	constructor(params: {
		id: string;
		address: string;
		multisigId: string;
		permissions: { mask: number };
		createdAt: Date;
		updatedAt: Date;
	}) {
		this.id = params.id;
		this.address = params.address;
		this.multisigId = params.multisigId;
		this.permissions = params.permissions;
		this.createdAt = params.createdAt;
		this.updatedAt = params.updatedAt;
	}
}
