export class Multisig {
	public readonly id: string;
	public readonly address: string;
	public readonly label: string | null;
	public readonly createdAt: Date;
	public readonly updatedAt: Date;

	constructor(params: {
		id: string;
		address: string;
		label: string | null;
		createdAt: Date;
		updatedAt: Date;
	}) {
		this.id = params.id;
		this.address = params.address;
		this.label = params.label;
		this.createdAt = params.createdAt;
		this.updatedAt = params.updatedAt;
	}
}
