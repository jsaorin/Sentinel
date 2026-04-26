import type { Metadata } from "next";
import { getThreatSignals } from "@/lib/api";
import { ScannerClient } from "./ScannerClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Scanner",
	description:
		"Real-time threat detection for Solana. Live agent activity feed and AI-analyzed threat signals.",
};

export default async function ScannerPage() {
	let signals: Awaited<ReturnType<typeof getThreatSignals>> = {
		items: [],
		pagination: { page: 1, pageSize: 20, total: 0, totalPages: 1 },
	};

	try {
		signals = await getThreatSignals({
			page: 1,
			pageSize: 20,
			isThreat: true,
			sortBy: "capturedAt",
			sortOrder: "desc",
		});
	} catch {
		/* API unavailable — render empty table */
	}

	return (
		<main className="min-h-screen">
			<div className="max-w-6xl mx-auto px-6 py-16">
				<div className="text-center mb-12">
					<h1 className="font-display text-3xl font-bold">AI Scanner</h1>
					<p className="text-text-secondary mt-3 text-lg">
						Real-time threat detection for Solana multisig protocols.
					</p>
				</div>

				<ScannerClient
					initialSignals={signals.items}
					initialPagination={signals.pagination}
				/>
			</div>
		</main>
	);
}
