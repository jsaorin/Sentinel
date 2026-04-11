import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Multisigs",
	description:
		"Explore monitored Solana multisig wallets. View security scores, signer analysis, and risk assessments.",
};

export default function MultisigsPage() {
	return (
		<main className="min-h-screen">
			<div className="max-w-6xl mx-auto px-6 py-8">
				<h1 className="font-display text-2xl font-bold">Multisigs</h1>
				<p className="text-text-tertiary mt-2">Coming soon</p>
			</div>
		</main>
	);
}
