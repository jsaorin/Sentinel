"use client";

import { useEffect, useState } from "react";
import { Card } from "@sentinel/ui";

type TokenBalance = {
  mint: string;
  symbol: string | null;
  name: string | null;
  amount: string;
  decimals: number;
  uiAmount: number | null;
};

type Balances = {
  sol: number;
  tokens: TokenBalance[];
};

type BalanceCardProps = {
  address: string;
};

export function BalanceCard({ address }: BalanceCardProps) {
  const [balances, setBalances] = useState<Balances | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  console.log(balances);
  useEffect(() => {
    async function fetchBalances() {
      try {
        const res = await fetch(`/api/balances/${address}`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        console.log(data);
        setBalances(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    if (address) fetchBalances();
  }, [address]);

  if (loading) {
    return (
      <Card variant="default" padding="lg">
        <h3 className="text-lg font-semibold pb-4 border-b border-border-subtle">
          Balances
        </h3>
        <p className="py-6 text-center text-text-tertiary text-sm">
          Loading...
        </p>
      </Card>
    );
  }

  if (error || !balances) {
    return (
      <Card variant="default" padding="lg">
        <h3 className="text-lg font-semibold pb-4 border-b border-border-subtle">
          Balances
        </h3>
        <p className="py-6 text-center text-text-tertiary text-sm">
          Unable to fetch balances
        </p>
      </Card>
    );
  }

  return (
    <Card variant="default" padding="lg">
      <h3 className="text-lg font-semibold pb-4 border-b border-border-subtle">
        Balances
      </h3>
      <div className="mt-1">
        {/* SOL balance */}
        <div className="flex items-center justify-between py-3 border-b border-border-subtle">
          <span className="text-text-tertiary text-sm uppercase tracking-wider font-semibold">
            SOL
          </span>
          <span className="font-mono text-md text-text-primary">
            {balances.sol.toLocaleString(undefined, {
              maximumFractionDigits: 4,
            })}
          </span>
        </div>

        {/* Token balances */}
        {balances.tokens.slice(0, 10).map((token) => (
          <div
            key={token.mint}
            className="flex items-center justify-between py-3 border-b border-border-subtle last:border-b-0"
          >
            <span className="text-sm text-text-tertiary truncate max-w-[60%]">
              <span className="font-semibold uppercase tracking-wider text-text-secondary">
                {token.symbol ?? `${token.mint.slice(0, 6)}..${token.mint.slice(-4)}`}
              </span>
            </span>
            <span className="font-mono text-md text-text-primary">
              {token.uiAmount?.toLocaleString(undefined, {
                maximumFractionDigits: 4,
              }) ?? "0"}
            </span>
          </div>
        ))}

        {balances.tokens.length === 0 && (
          <p className="py-3 text-text-tertiary text-sm">No token balances</p>
        )}
      </div>
    </Card>
  );
}
