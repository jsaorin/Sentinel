import type { GetProposalDetailQueryOutputSigner } from "@sentinel/application";
import type { ProposalSignerDto } from "@sentinel/common/dtos";
import { decodePermissionsMask } from "@sentinel/common/utils";

export function toProposalSignerDto(
	entry: GetProposalDetailQueryOutputSigner,
): ProposalSignerDto {
	const { signer, totalProposalsInMultisig } = entry;
	return {
		address: signer.address,
		permissions: {
			mask: signer.permissions.mask,
			...decodePermissionsMask(signer.permissions.mask),
		},
		totalProposalsInMultisig,
	};
}
