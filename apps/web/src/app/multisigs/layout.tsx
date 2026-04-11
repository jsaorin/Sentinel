import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Multisigs",
	description:
		"Explore monitored Solana multisig wallets. View security scores, signer analysis, and risk assessments.",
};

export default function MultisigsLayout({
	children,
}: { children: React.ReactNode }) {
	return children;
}
