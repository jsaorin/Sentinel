import { Card } from "@sentinel/ui";
import { SignerRow } from "./SignerRow";

type RiskLevel = "critical" | "high" | "medium" | "low" | "safe" | "info" | "unknown";

type Signer = {
	address: string;
	label: string;
	status: string;
	riskLevel: RiskLevel;
};

type SignersListProps = {
	signers: Signer[];
};

export function SignersList({ signers }: SignersListProps) {
	return (
		<Card variant="default" padding="lg">
			<h3 className="text-lg font-semibold pb-4 border-b border-border-subtle">
				Signers ({signers.length})
			</h3>
			<div className="mt-1">
				{signers.map((signer, i) => (
					<SignerRow
						key={signer.address}
						address={signer.address}
						label={signer.label}
						status={signer.status}
						riskLevel={signer.riskLevel}
						isLast={i === signers.length - 1}
					/>
				))}
			</div>
		</Card>
	);
}
