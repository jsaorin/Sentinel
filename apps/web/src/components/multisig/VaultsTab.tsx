"use client";

import { VaultCard } from "./VaultCard";

type Vault = {
	vaultIndex: number;
	pda: string;
};

type VaultsTabProps = {
	vaults: Vault[];
};

export function VaultsTab({ vaults }: VaultsTabProps) {
	return (
		<div className="space-y-6">
			{vaults.map((v) => (
				<VaultCard key={v.pda} vaultIndex={v.vaultIndex} pda={v.pda} />
			))}
		</div>
	);
}
