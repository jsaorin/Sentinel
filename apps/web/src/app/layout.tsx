import { IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-ibm-plex-sans",
	display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-jetbrains-mono",
	display: "swap",
});

export const metadata: Metadata = {
	title: "Sentinel",
	description: "AI-powered multisig security scoring for Solana",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className={`dark ${ibmPlexSans.variable} ${jetbrainsMono.variable}`}>
			<body className="bg-bg-base text-text-primary antialiased">{children}</body>
		</html>
	);
}
