import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Scanner",
	description:
		"Scan Solana transactions for durable nonce attacks and suspicious patterns. Real-time threat detection for multisig protocols.",
};

export default function ScannerPage() {
	return (
		<main className="min-h-screen">
			<div className="max-w-6xl mx-auto px-6 py-8">
				<h1 className="font-display text-2xl font-bold">AI Scanner</h1>
				<p className="text-text-tertiary mt-2">Coming soon</p>
			</div>
		</main>
	);
}
