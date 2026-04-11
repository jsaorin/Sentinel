import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Analyze",
	description:
		"Analyze any Solana multisig wallet. Get instant AI-powered security scoring, signer behavior analysis, and risk detection.",
};

export default function AnalyzePage() {
	return (
		<main className="min-h-screen">
			<div className="max-w-6xl mx-auto px-6 py-8">
				<h1 className="font-display text-2xl font-bold">Analyze</h1>
				<p className="text-text-tertiary mt-2">Coming soon</p>
			</div>
		</main>
	);
}
