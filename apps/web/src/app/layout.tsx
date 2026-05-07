import { IBM_Plex_Sans, Orbitron, JetBrains_Mono } from "next/font/google";
import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { RealtimeProvider } from "@/contexts/RealtimeContext";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-ibm-plex-sans",
	display: "swap",
});

const orbitron = Orbitron({
	subsets: ["latin"],
	variable: "--font-orbitron",
	display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-jetbrains-mono",
	display: "swap",
});

export const metadata: Metadata = {
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_BASE_URL ?? "https://sentinel-web-kappa.vercel.app",
	),
	title: {
		default: "Sentinel — AI-Powered Multisig Security for Solana",
		template: "%s | Sentinel",
	},
	description:
		"Score every proposal. Detect signer anomalies. Catch durable nonce attacks before they drain your protocol. AI-powered security scoring for Solana multisigs.",
	keywords: [
		"Solana multisig security",
		"multisig risk scoring",
		"Squads multisig",
		"durable nonce detection",
		"Solana security",
		"multisig proposal scoring",
		"AI blockchain security",
		"Solana DeFi security",
		"signer behavior analysis",
		"Sentinel security",
	],
	authors: [{ name: "Sentinel" }],
	creator: "Sentinel",
	icons: {
		icon: "/favicon.svg",
		apple: "/sentinel-logo.png",
	},
	openGraph: {
		type: "website",
		siteName: "Sentinel",
		title: "Sentinel — AI-Powered Multisig Security for Solana",
		description:
			"Score every proposal. Detect signer anomalies. Catch durable nonce attacks before they drain your protocol.",
		locale: "en_US",
		images: [
			{
				url: "/OG.png",
				width: 1200,
				height: 630,
				alt: "Sentinel — AI-Powered Multisig Security",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		images: ["/OG.png"],
		title: "Sentinel — AI-Powered Multisig Security for Solana",
		description:
			"AI-powered security scoring for Solana multisigs. Score proposals, detect anomalies, catch attacks.",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
};

export default function RootLayout({
	children,
}: { children: React.ReactNode }) {
	return (
		<html
			lang="en"
			className={`dark ${ibmPlexSans.variable} ${orbitron.variable} ${jetbrainsMono.variable}`}
		>
			<body className="bg-bg-base text-text-primary antialiased overflow-x-hidden">
				<Navbar />
				<RealtimeProvider>{children}</RealtimeProvider>
			</body>
		</html>
	);
}
