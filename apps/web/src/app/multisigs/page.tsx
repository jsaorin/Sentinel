"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, RiskBadge } from "@sentinel/ui";
import { SearchIcon } from "@/components/icons";

type RiskLevel = "critical" | "high" | "medium" | "low" | "safe";

type Multisig = {
  address: string;
  label: string;
  threshold: { current: number; total: number };
  score: number;
  riskLevel: RiskLevel;
  lastActivity: string;
};

const MOCK_MULTISIGS: Multisig[] = [
  {
    address: "7gYJPNhRsyuiFWTr9apSUqbBHTNVV3bfya4RoHwbD6vp",
    label: "Drift Protocol",
    threshold: { current: 3, total: 5 },
    score: 73,
    riskLevel: "low",
    lastActivity: "2 min ago",
  },
  {
    address: "3mQ7dL8kR9pN2wBvT5zF1w",
    label: "Marinade Finance",
    threshold: { current: 2, total: 3 },
    score: 12,
    riskLevel: "critical",
    lastActivity: "5 min ago",
  },
  {
    address: "9pR2vN5cX8hG6yL4wK8e",
    label: "Jupiter Exchange",
    threshold: { current: 4, total: 7 },
    score: 51,
    riskLevel: "medium",
    lastActivity: "12 min ago",
  },
  {
    address: "5nL4cX7bR2hG6yK8pN1w",
    label: "Tensor NFT",
    threshold: { current: 2, total: 5 },
    score: 85,
    riskLevel: "safe",
    lastActivity: "18 min ago",
  },
  {
    address: "2jM8bR4cD0rK7nL3pQ5x",
    label: "Raydium",
    threshold: { current: 3, total: 5 },
    score: 34,
    riskLevel: "high",
    lastActivity: "27 min ago",
  },
  {
    address: "8tV6sK9pN2xR4wL7mB3q",
    label: "Orca",
    threshold: { current: 5, total: 9 },
    score: 67,
    riskLevel: "low",
    lastActivity: "34 min ago",
  },
  {
    address: "4kR9mN3xL7bV2pT5wQ8y",
    label: "Jito Labs",
    threshold: { current: 3, total: 5 },
    score: 91,
    riskLevel: "safe",
    lastActivity: "1 hr ago",
  },
  {
    address: "6fH2jW5kR8mN1pL4xB7v",
    label: "Marginfi",
    threshold: { current: 2, total: 4 },
    score: 45,
    riskLevel: "medium",
    lastActivity: "1 hr ago",
  },
  {
    address: "1aD3eG6hJ9kL2mN5pQ8r",
    label: "Phantom Treasury",
    threshold: { current: 4, total: 6 },
    score: 88,
    riskLevel: "safe",
    lastActivity: "2 hr ago",
  },
  {
    address: "7bE4fH8iK1lM3nO6pR9s",
    label: "Solend",
    threshold: { current: 2, total: 3 },
    score: 29,
    riskLevel: "high",
    lastActivity: "2 hr ago",
  },
  {
    address: "2cF5gI9jL2mN4oP7qS0t",
    label: "Kamino Finance",
    threshold: { current: 3, total: 5 },
    score: 62,
    riskLevel: "low",
    lastActivity: "3 hr ago",
  },
  {
    address: "8dG6hJ0kM3nO5pQ8rT1u",
    label: "Helium Foundation",
    threshold: { current: 5, total: 7 },
    score: 78,
    riskLevel: "low",
    lastActivity: "3 hr ago",
  },
  {
    address: "3eH7iK1lN4oP6qR9sU2v",
    label: "Pyth Network",
    threshold: { current: 3, total: 5 },
    score: 82,
    riskLevel: "safe",
    lastActivity: "4 hr ago",
  },
  {
    address: "9fI8jL2mO5pQ7rS0tV3w",
    label: "Wormhole",
    threshold: { current: 4, total: 6 },
    score: 15,
    riskLevel: "critical",
    lastActivity: "5 hr ago",
  },
  {
    address: "4gJ9kM3nP6qR8sT1uW4x",
    label: "Mango Markets",
    threshold: { current: 2, total: 5 },
    score: 38,
    riskLevel: "high",
    lastActivity: "6 hr ago",
  },
  {
    address: "0hK0lN4oQ7rS9tU2vX5y",
    label: "Squads Treasury",
    threshold: { current: 3, total: 3 },
    score: 95,
    riskLevel: "safe",
    lastActivity: "7 hr ago",
  },
  {
    address: "5iL1mO5pR8sT0uV3wY6z",
    label: "Star Atlas",
    threshold: { current: 2, total: 4 },
    score: 56,
    riskLevel: "medium",
    lastActivity: "8 hr ago",
  },
  {
    address: "6jM2nP6qS9tU1vW4xZ7a",
    label: "Sanctum",
    threshold: { current: 3, total: 5 },
    score: 71,
    riskLevel: "low",
    lastActivity: "10 hr ago",
  },
  {
    address: "7kN3oQ7rT0uV2wX5yA8b",
    label: "Meteora",
    threshold: { current: 2, total: 3 },
    score: 44,
    riskLevel: "medium",
    lastActivity: "12 hr ago",
  },
  {
    address: "8lO4pR8sU1vW3xY6zA9c",
    label: "Zeta Markets",
    threshold: { current: 4, total: 5 },
    score: 83,
    riskLevel: "safe",
    lastActivity: "14 hr ago",
  },
  {
    address: "9mP5qS9tV2wX4yZ7aB0d",
    label: "Hubble Protocol",
    threshold: { current: 2, total: 4 },
    score: 18,
    riskLevel: "critical",
    lastActivity: "1 day ago",
  },
  {
    address: "0nQ6rT0uW3xY5zA8bC1e",
    label: "Tulip Protocol",
    threshold: { current: 3, total: 5 },
    score: 59,
    riskLevel: "medium",
    lastActivity: "1 day ago",
  },
  {
    address: "1oR7sU1vX4yZ6aB9cD2f",
    label: "Lido (wstSOL)",
    threshold: { current: 5, total: 7 },
    score: 87,
    riskLevel: "safe",
    lastActivity: "2 days ago",
  },
  {
    address: "2pS8tV2wY5zA7bC0dE3g",
    label: "Switchboard",
    threshold: { current: 3, total: 5 },
    score: 65,
    riskLevel: "low",
    lastActivity: "2 days ago",
  },
];

const RISK_FILTERS = [
  "All",
  "Critical",
  "High",
  "Medium",
  "Low",
  "Safe",
] as const;
const PAGE_SIZE = 10;

export default function MultisigsPage() {
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("All");
  const [page, setPage] = useState(0);

  const filtered = MOCK_MULTISIGS.filter((m) => {
    const matchesSearch =
      !search ||
      m.address.toLowerCase().includes(search.toLowerCase()) ||
      m.label.toLowerCase().includes(search.toLowerCase());
    const matchesRisk =
      riskFilter === "All" || m.riskLevel === riskFilter.toLowerCase();
    return matchesSearch && matchesRisk;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(0);
  }

  function handleRiskFilter(f: string) {
    setRiskFilter(f);
    setPage(0);
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-3xl font-bold">Multisigs</h1>
          <p className="text-text-secondary mt-3 text-lg">
            Explore monitored Solana multisig wallets and their security scores.
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-bg-card border border-border-default rounded-md p-2 mb-6 max-w-xl mx-auto focus-within:border-border-strong transition-colors">
          <SearchIcon className="w-5 h-5 text-text-tertiary shrink-0 ml-2" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by address or label..."
            className="flex-1 bg-transparent py-2 text-text-primary font-mono placeholder:text-text-tertiary focus:outline-none text-md"
          />
        </div>

        {/* Table */}
        <Card variant="default" padding="lg">
          {/* Risk filter tabs inside card header */}
          <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-border-subtle">
            {RISK_FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => handleRiskFilter(f)}
                className={[
                  "px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors rounded-md",
                  riskFilter === f
                    ? "bg-bg-raised text-text-primary border border-border-default"
                    : "text-text-tertiary hover:text-text-secondary",
                ].join(" ")}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Table header — desktop only */}
          <div className="hidden md:flex items-center py-3 px-2 text-xs uppercase tracking-wider font-semibold text-text-tertiary border-b border-border-subtle">
            <span className="flex-1 min-w-0">Address</span>
            <span className="w-36 text-left">Label</span>
            <span className="w-20 text-left hidden lg:block">Threshold</span>
            <span className="w-16 text-right">Score</span>
            <span className="w-24 text-right">Risk</span>
          </div>

          {/* Rows */}
          <div>
            {paginated.length === 0 ? (
              <p className="py-12 text-center text-text-tertiary text-sm">
                No multisigs found
              </p>
            ) : (
              paginated.map((m, i) => (
                <Link
                  key={m.address}
                  href={`/multisig/${m.address}`}
                  className={[
                    "flex items-center justify-between py-4 px-2 hover:bg-bg-hover transition-colors",
                    i < paginated.length - 1
                      ? "border-b border-border-subtle"
                      : "",
                  ].join(" ")}
                >
                  {/* Mobile: address + label stacked, badge on right */}
                  <div className="flex-1 min-w-0 md:hidden">
                    <span className="font-mono text-md text-text-link truncate block">
                      {m.address.slice(0, 8)}..{m.address.slice(-4)}
                    </span>
                    <span className="text-xs text-text-tertiary">
                      {m.label} &middot; {m.threshold.current}/
                      {m.threshold.total}
                    </span>
                  </div>

                  {/* Desktop: full row */}
                  <span className="flex-1 min-w-0 font-mono text-md text-text-link truncate hidden md:block">
                    {m.address.slice(0, 8)}..{m.address.slice(-4)}
                  </span>
                  <span className="w-36 text-left text-md text-text-secondary truncate hidden md:block">
                    {m.label}
                  </span>
                  <span className="w-20 text-left font-mono text-md text-text-secondary hidden lg:block">
                    {m.threshold.current}/{m.threshold.total}
                  </span>
                  <span className="w-16 text-right font-mono text-md text-text-primary hidden md:block">
                    {m.score}
                  </span>
                  <span className="w-24 flex justify-end shrink-0">
                    <RiskBadge level={m.riskLevel} size="sm" />
                  </span>
                </Link>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-border-subtle">
              <span className="text-xs text-text-tertiary">
                {page * PAGE_SIZE + 1}–
                {Math.min((page + 1) * PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-text-secondary disabled:text-text-disabled transition-colors"
                >
                  Prev
                </button>
                <span className="text-xs text-text-secondary font-mono">
                  {page + 1}/{totalPages}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={page === totalPages - 1}
                  className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-text-secondary disabled:text-text-disabled transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
