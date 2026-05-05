"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@sentinel/ui";
import { SearchIcon } from "@/components/icons";
import { createMultisig } from "@/lib/api";

const TABS = [
	{ id: "multisig", label: "Multisig Address" },
	{ id: "proposal", label: "Raw Proposal Data" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AnalyzePage() {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<TabId>("multisig");
	const [address, setAddress] = useState("");
	const [error, setError] = useState("");

	async function handleMultisigSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		const trimmed = address.trim();
		if (!trimmed) {
			setError("Please enter a multisig address");
			return;
		}
		try {
			await createMultisig(trimmed);
		} catch {
			// API may be unavailable — still navigate to the page (it will show mock data)
		}
		router.push(`/multisig/${trimmed}`);
	}

return (
		<main className="min-h-screen">
			<div className="max-w-3xl mx-auto px-6 py-16">
				{/* Header */}
				<div className="text-center mb-12">
					<h1 className="font-display text-3xl font-bold">Analyze</h1>
					<p className="text-text-secondary mt-3 text-lg">
						Analyze any Solana multisig wallet or proposal transaction. Get
						instant AI-powered security scoring and risk detection.
					</p>
				</div>

				{/* Tab switcher */}
				<div className="flex border-b border-border-subtle mb-8">
					{TABS.map((tab) => (
						<button
							key={tab.id}
							type="button"
							onClick={() => {
								setActiveTab(tab.id);
								setError("");
							}}
							className={[
								"px-6 py-3 text-xs uppercase tracking-wider font-semibold transition-colors",
								activeTab === tab.id
									? "text-text-primary border-b-2 border-text-primary"
									: "text-text-tertiary hover:text-text-secondary",
							].join(" ")}
						>
							{tab.label}
						</button>
					))}
				</div>

				{/* Multisig Address Tab */}
				{activeTab === "multisig" && (
					<Card variant="default" padding="lg">
						<h2 className="text-lg font-semibold pb-4 border-b border-border-subtle">
							Multisig Wallet Analysis
						</h2>
						<p className="text-text-tertiary text-sm mt-4 mb-6">
							Enter a Solana multisig address (Squads v4) to analyze its
							security configuration, signer behavior, and proposal history.
						</p>
						<form onSubmit={handleMultisigSubmit} className="space-y-4">
							<div className="flex items-center gap-2 bg-bg-surface border border-border-default rounded-md p-2 focus-within:border-border-strong transition-colors">
								<SearchIcon className="w-5 h-5 text-text-tertiary shrink-0 ml-2" />
								<input
									type="text"
									value={address}
									onChange={(e) => setAddress(e.target.value)}
									placeholder="e.g. 7xK9f2qR8mNpL3wBvT5aB3qW5nR8kJ2..."
									className="flex-1 bg-transparent py-3 text-text-primary font-mono placeholder:text-text-tertiary focus:outline-none text-md"
								/>
							</div>
							{error && <p className="text-critical text-sm">{error}</p>}
							<button
								type="submit"
								className="w-full py-3 bg-primary text-text-inverse text-xs uppercase tracking-wider font-semibold rounded-md hover:bg-primary-hover transition-colors"
							>
								Analyze Multisig
							</button>
						</form>
					</Card>
				)}

				{/* Raw Proposal Data Tab */}
				{activeTab === "proposal" && (
					<Card variant="default" padding="lg">
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<span className="text-xs uppercase tracking-wider font-semibold text-text-tertiary bg-bg-raised border border-border-subtle rounded-md px-3 py-1.5 mb-4">
								Coming Soon
							</span>
							<h2 className="text-lg font-semibold">
								Proposal Transaction Analysis
							</h2>
							<p className="text-text-tertiary text-sm mt-3 max-w-md">
								Paste raw proposal transaction data (base64 or JSON) to analyze
								it for risk factors, durable nonce usage, authority changes, and
								known attack patterns.
							</p>
						</div>
					</Card>
				)}
			</div>
		</main>
	);
}
