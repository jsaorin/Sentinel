import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Proposals",
	description:
		"Browse and analyze risk scores for the latest Solana multisig proposals. AI-powered security assessment for every transaction.",
};

export default function ProposalsPage() {
	return (
		<main className="min-h-screen">
			<div className="max-w-6xl mx-auto px-6 py-8">
				<h1 className="font-display text-2xl font-bold">Proposals</h1>
				<p className="text-text-tertiary mt-2">Coming soon</p>
			</div>
		</main>
	);
}
