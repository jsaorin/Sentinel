import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Sentinel",
	description: "AI-powered multisig security scoring for Solana",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
