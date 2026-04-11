import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Analyze",
	description:
		"Analyze any Solana multisig wallet. Get instant AI-powered security scoring, signer behavior analysis, and risk detection.",
};

export default function AnalyzeLayout({
	children,
}: { children: React.ReactNode }) {
	return children;
}
