import { decodePermissionsMask } from "@sentinel/common/utils";
import type { SignerDto } from "@sentinel/common/dtos";

export interface SignerLike {
	id: string;
	address: string;
	permissions: { mask: number };
}

export function toSignerDto(signer: SignerLike): SignerDto {
	return {
		id: signer.id,
		address: signer.address,
		permissions: {
			mask: signer.permissions.mask,
			...decodePermissionsMask(signer.permissions.mask),
		},
	};
}
