import {
	MultisigHeader,
	MultisigLiveSection,
	MultisigNotFound,
	NewAnalysisToast,
	ProposalHistory,
	SignersList,
	VaultsTab,
} from "@/components/multisig";
import { getMultisig, getProposals, getSigners } from "@/lib/api";
import {
	SOLANA_ADDRESS_RE,
	SOLSCAN_BASE,
	STATUS_DISPLAY,
	WARNING_SEVERITY,
} from "@/lib/constants";
import { getRiskLevel } from "@/lib/risk";
import type { Metadata } from "next";
import { MultisigRealtimeRefresh } from "./MultisigRealtimeRefresh";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ address: string }>;
}): Promise<Metadata> {
	const { address } = await params;
	return {
		title: `Multisig ${address.slice(0, 8)}...`,
		description: `Security report for Solana multisig ${address}. Risk score, signer analysis, and proposal history.`,
	};
}

export default async function MultisigPage({
	params,
}: { params: Promise<{ address: string }> }) {
	const { address } = await params;

	try {
		const [multisig, signers, proposalsResult] = await Promise.all([
			getMultisig(address),
			getSigners(address),
			getProposals(address),
		]);

		const { proposals, pagination } = proposalsResult;

		const latestProposal =
			proposals.length > 0
				? proposals.sort(
						(a, b) =>
							new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
					)[0]
				: null;

		const created = new Date(multisig.createdAt).toLocaleDateString();
		const lastActivity = latestProposal
			? timeAgo(new Date(latestProposal.createdAt))
			: "No activity";

		const signersData = signers.map((s) => ({
			address: s.address,
			permissions: s.permissions,
		}));

		const proposalsData = proposals.map((p) => ({
			id: `#${p.proposalIndex}`,
			linkId: p.id,
			description:
				p.summary ??
				(p.instructions.length > 0
					? `${p.instructions.length} instruction${p.instructions.length > 1 ? "s" : ""}`
					: "Empty proposal"),
			status: STATUS_DISPLAY[p.status] ?? ("Pending" as const),
			riskLevel: p.riskScore != null ? getRiskLevel(p.riskScore) : null,
		}));

		const signersTab = {
			id: "signers",
			label: `Signers (${signers.length})`,
			shortLabel: "Signers",
			content: <SignersList signers={signersData} />,
		};

		const proposalsTab = {
			id: "proposals",
			label: `Proposals (${pagination.total})`,
			shortLabel: "Proposals",
			content: (
				<ProposalHistory
					address={address}
					initialProposals={proposalsData}
					totalProposals={pagination.total}
					totalPages={pagination.totalPages}
				/>
			),
		};

		const vaultsTab =
			multisig.vaults.length > 0
				? {
						id: "vaults",
						label: `Vaults (${multisig.vaults.length})`,
						shortLabel: "Vaults",
						content: <VaultsTab vaults={multisig.vaults} />,
					}
				: undefined;

		return (
			<main className="min-h-screen pb-16">
				<MultisigRealtimeRefresh multisigId={multisig.id} />
				<MultisigHeader />
				<NewAnalysisToast multisigId={multisig.id} />

				<MultisigLiveSection
					address={address}
					initialMultisig={multisig}
					created={created}
					lastActivity={lastActivity}
					signersTab={signersTab}
					proposalsTab={proposalsTab}
					vaultsTab={vaultsTab}
				/>
			</main>
		);
	} catch (err) {
		console.error("[MultisigPage] Error fetching data:", err);
		return (
			<main className="min-h-screen pb-16">
				<MultisigHeader />
				<MultisigNotFound address={address} />
			</main>
		);
	}
}

function timeAgo(date: Date): string {
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMin = Math.floor(diffMs / 60000);
	if (diffMin < 1) return "just now";
	if (diffMin < 60) return `${diffMin} min ago`;
	const diffHr = Math.floor(diffMin / 60);
	if (diffHr < 24) return `${diffHr} hr ago`;
	const diffDays = Math.floor(diffHr / 24);
	return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}
