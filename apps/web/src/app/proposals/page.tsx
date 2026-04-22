import type { Metadata } from "next";
import { getAllProposals } from "@/lib/api";
import { ProposalsTable } from "./ProposalsTable";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Proposals",
	description:
		"Browse and analyze risk scores for the latest Solana multisig proposals. AI-powered security assessment for every transaction.",
};

export default async function ProposalsPage() {
	const { proposals, pagination } = await getAllProposals(1);

	return (
		<main className="min-h-screen">
			<div className="max-w-6xl mx-auto px-6 py-16">
				<div className="text-center mb-12">
					<h1 className="font-display text-3xl font-bold">Proposals</h1>
					<p className="text-text-secondary mt-3 text-lg">
						Browse risk scores for the latest Solana multisig proposals.
					</p>
				</div>

				<ProposalsTable
					initialProposals={proposals}
					initialPagination={pagination}
				/>
			</div>
		</main>
	);
}
