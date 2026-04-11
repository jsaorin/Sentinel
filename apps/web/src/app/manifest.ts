import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Sentinel",
		short_name: "Sentinel",
		description: "AI-Powered Multisig Security for Solana",
		start_url: "/",
		display: "standalone",
		background_color: "#000000",
		theme_color: "#000000",
		icons: [
			{ src: "/sentinel-icon.svg", sizes: "any", type: "image/svg+xml" },
			{ src: "/sentinel-logo.png", sizes: "512x512", type: "image/png" },
		],
	};
}
