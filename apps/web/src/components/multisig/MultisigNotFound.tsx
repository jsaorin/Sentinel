"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@sentinel/ui";
import { createMultisig } from "@/lib/api";

type MultisigNotFoundProps = {
	address: string;
};

export function MultisigNotFound({ address }: MultisigNotFoundProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	async function handleAnalyze() {
		setLoading(true);
		setError("");
		try {
			await createMultisig(address);
			router.refresh();
		} catch {
			setError("Failed to analyze this address. Please check it is a valid Squads v4 multisig.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="max-w-2xl mx-auto px-6 py-16 text-center">
			<Card variant="default" padding="lg">
				<h2 className="font-display text-2xl font-bold">
					Multisig Not Found
				</h2>
				<p className="text-text-secondary mt-3 text-md">
					The address has not been analyzed yet.
				</p>
				<p className="font-mono text-sm text-text-tertiary mt-2 break-all">
					{address}
				</p>

				{error && (
					<p className="text-critical text-sm mt-4">{error}</p>
				)}

				<div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
					<button
						type="button"
						onClick={handleAnalyze}
						disabled={loading}
						className="px-6 py-3 bg-primary text-text-inverse text-xs uppercase tracking-wider font-semibold rounded-md hover:bg-primary-hover transition-colors disabled:opacity-50"
					>
						{loading ? "Analyzing..." : "Analyze Now"}
					</button>
					<Link
						href="/analyze"
						className="px-6 py-3 text-xs uppercase tracking-wider font-semibold text-text-secondary hover:text-text-primary transition-colors"
					>
						Go to Analyze
					</Link>
				</div>
			</Card>
		</div>
	);
}
