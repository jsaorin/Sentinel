import type { Metadata } from "next";
import {
	MultisigHeader,
	InfoCard,
	ScoreCard,
	SignersList,
	ReportCard,
	ProposalHistory,
	BalanceCard,
	MultisigNotFound,
} from "@/components/multisig";
import { getMultisig, getSigners, getProposals } from "@/lib/api";
import type { RiskLevel } from "@/lib/risk";

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

function permissionsLabel(p: {
	initiate: boolean;
	vote: boolean;
	execute: boolean;
}): string {
	const parts: string[] = [];
	if (p.initiate) parts.push("Initiate");
	if (p.vote) parts.push("Vote");
	if (p.execute) parts.push("Execute");
	return parts.join(", ") || "None";
}

const STATUS_MAP: Record<string, "Pending" | "Executed" | "Rejected"> = {
	DRAFT: "Pending",
	ACTIVE: "Pending",
	APPROVED: "Pending",
	REJECTED: "Rejected",
	EXECUTED: "Executed",
	CANCELLED: "Rejected",
};

// Mock risk levels until AI scoring is implemented
const MOCK_SIGNER_RISKS: RiskLevel[] = [
	"safe",
	"safe",
	"medium",
	"safe",
	"low",
];
const MOCK_PROPOSAL_RISKS: RiskLevel[] = [
	"high",
	"safe",
	"low",
	"safe",
	"critical",
];
const MOCK_SCORE = 73;

export default async function MultisigPage({
	params,
}: { params: Promise<{ address: string }> }) {
	const { address } = await params;

	console.log("[MultisigPage] Fetching data for address:", address);
	console.log("[MultisigPage] API_BASE:", process.env.NEXT_PUBLIC_API_URL);

	try {
		const [multisig, signers, proposals] = await Promise.all([
			getMultisig(address),
			getSigners(address),
			getProposals(address),
		]);

		console.log("[MultisigPage] Multisig:", JSON.stringify(multisig, null, 2));
		console.log("[MultisigPage] Signers:", JSON.stringify(signers, null, 2));
		console.log("[MultisigPage] Proposals count:", proposals.length);

		const latestProposal =
			proposals.length > 0
				? proposals.sort(
						(a, b) =>
							new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
					)[0]
				: null;

		const multisigData = {
			address: multisig.address,
			threshold: {
				current: multisig.threshold ?? 0,
				total: signers.length,
			},
			created: new Date(multisig.createdAt).toLocaleDateString(),
			lastActivity: latestProposal
				? timeAgo(new Date(latestProposal.createdAt))
				: "No activity",
		};

		const signersData = signers.map((s, i) => ({
			address: `${s.address.slice(0, 6)}..${s.address.slice(-4)}`,
			label: permissionsLabel(s.permissions),
			status: "Active",
			riskLevel: MOCK_SIGNER_RISKS[i % MOCK_SIGNER_RISKS.length] as RiskLevel,
		}));

		const proposalsData = proposals.map((p, i) => ({
			id: `#${p.proposalIndex}`,
			description:
				p.instructions.length > 0
					? `${p.instructions.length} instruction${p.instructions.length > 1 ? "s" : ""} — ${p.instructions[0].programId.slice(0, 8)}...`
					: "Empty proposal",
			status: STATUS_MAP[p.status] ?? ("Pending" as const),
			riskLevel: MOCK_PROPOSAL_RISKS[
				i % MOCK_PROPOSAL_RISKS.length
			] as RiskLevel,
		}));

		return (
			<main className="min-h-screen pb-16">
				<MultisigHeader />

				<div className="max-w-6xl mx-auto px-6 space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="md:col-span-2">
							<InfoCard
								address={multisigData.address}
								type="Squads v4"
								threshold={multisigData.threshold}
								created={multisigData.created}
								lastActivity={multisigData.lastActivity}
								score={MOCK_SCORE}
							/>
						</div>
						<ScoreCard score={MOCK_SCORE} />
					</div>

					<BalanceCard address={address} />

					<SignersList signers={signersData} />

					<ReportCard />

					<ProposalHistory proposals={proposalsData} />
				</div>
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
