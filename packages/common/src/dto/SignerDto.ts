export class SignerDto {
	id: string;
	address: string;
	permissions: {
		mask: number;
		initiate: boolean;
		vote: boolean;
		execute: boolean;
	};
}
