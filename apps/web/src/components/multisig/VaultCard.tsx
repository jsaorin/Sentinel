"use client";

import { useEffect, useState } from "react";
import { Card } from "@sentinel/ui";
import { SOL_LOGO, SOLSCAN_BASE } from "@/lib/constants";

type TokenBalance = {
	mint: string;
	symbol: string | null;
	name: string | null;
	logoURI: string | null;
	amount: string;
	decimals: number;
	uiAmount: number | null;
};

type Balances = {
	sol: number;
	tokens: TokenBalance[];
};

type VaultCardProps = {
	vaultIndex: number;
	pda: string;
};

function TokenIcon({ src, symbol }: { src: string | null; symbol: string | null }) {
	const fallbackLetter = (symbol ?? "?").charAt(0);

	if (!src) {
		return (
			<div className="w-7 h-7 rounded-full bg-bg-overlay flex items-center justify-center shrink-0">
				<span className="text-xs font-bold text-text-secondary">{fallbackLetter}</span>
			</div>
		);
	}

	return (
		<img
			src={src}
			alt={symbol ?? "token"}
			width={28}
			height={28}
			className="w-7 h-7 rounded-full shrink-0 bg-bg-overlay"
			onError={(e) => {
				const target = e.currentTarget;
				target.style.display = "none";
				const fallback = document.createElement("div");
				fallback.className = "w-7 h-7 rounded-full bg-bg-overlay flex items-center justify-center shrink-0";
				fallback.innerHTML = `<span class="text-xs font-bold text-text-secondary">${fallbackLetter}</span>`;
				target.parentNode?.insertBefore(fallback, target);
			}}
		/>
	);
}

export function VaultCard({ vaultIndex, pda }: VaultCardProps) {
	const [balances, setBalances] = useState<Balances | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	useEffect(() => {
		async function fetchBalances() {
			try {
				const res = await fetch(`/api/balances/${pda}`);
				if (!res.ok) throw new Error("Failed");
				const data = await res.json();
				setBalances(data);
			} catch {
				setError(true);
			} finally {
				setLoading(false);
			}
		}
		fetchBalances();
	}, [pda]);

	const truncatedPda = `${pda.slice(0, 4)}...${pda.slice(-4)}`;

	return (
		<Card variant="default" padding="lg">
			{/* Vault header */}
			<div className="flex items-center justify-between pb-4 border-b border-border-subtle">
				<h3 className="text-lg font-semibold">
					Vault {vaultIndex}
				</h3>
				<a
					href={`${SOLSCAN_BASE}/${pda}`}
					target="_blank"
					rel="noopener noreferrer"
					className="font-mono text-sm text-text-link hover:text-primary transition-colors"
				>
					{truncatedPda}
				</a>
			</div>

			{/* Loading state */}
			{loading && (
				<div className="py-8 text-center">
					<p className="text-text-tertiary text-sm">Loading balances...</p>
				</div>
			)}

			{/* Error state */}
			{error && (
				<div className="py-8 text-center">
					<p className="text-text-tertiary text-sm">Unable to fetch balances</p>
				</div>
			)}

			{/* Balance content */}
			{!loading && !error && balances && (
				<>
					{/* Token table header */}
					<div className="hidden sm:flex items-center py-3 text-xs uppercase tracking-wider font-semibold text-text-tertiary">
						<span className="flex-1">Coin</span>
						<span className="w-32 text-right">Balance</span>
					</div>

					{/* SOL row */}
					<div className="flex items-center justify-between py-3 border-b border-border-subtle">
						<div className="flex items-center gap-3 min-w-0">
							<TokenIcon src={SOL_LOGO} symbol="SOL" />
							<div className="min-w-0">
								<span className="text-md font-semibold text-text-primary block">
									SOL
								</span>
								<span className="font-mono text-xs text-text-tertiary">
									So1...1112
								</span>
							</div>
						</div>
						<span className="font-mono text-md text-text-primary tabular-nums">
							{balances.sol.toLocaleString(undefined, {
								maximumFractionDigits: 4,
							})}
						</span>
					</div>

					{/* Token rows */}
					{balances.tokens.map((token) => (
						<div
							key={token.mint}
							className="flex items-center justify-between py-3 border-b border-border-subtle last:border-b-0"
						>
							<div className="flex items-center gap-3 min-w-0">
								<TokenIcon src={token.logoURI} symbol={token.symbol} />
								<div className="min-w-0">
									<span className="text-md font-semibold text-text-primary block truncate">
										{token.symbol ?? "Unknown"}
									</span>
									<span className="font-mono text-xs text-text-tertiary">
										{token.mint.slice(0, 4)}...{token.mint.slice(-4)}
									</span>
								</div>
							</div>
							<span className="font-mono text-md text-text-primary tabular-nums">
								{token.uiAmount?.toLocaleString(undefined, {
									maximumFractionDigits: 4,
								}) ?? "0"}
							</span>
						</div>
					))}

					{balances.tokens.length === 0 && balances.sol === 0 && (
						<p className="py-6 text-center text-text-tertiary text-sm">
							No balances in this vault
						</p>
					)}
				</>
			)}
		</Card>
	);
}
