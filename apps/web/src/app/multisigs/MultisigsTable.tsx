"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, RiskBadge } from "@sentinel/ui";
import { SearchIcon } from "@/components/icons";
import { getLevel } from "@/lib/risk";
import type { MultisigListItemResponse } from "@/lib/api";
import { RISK_FILTERS, PAGE_SIZE } from "@/lib/constants";

type MultisigsTableProps = {
	multisigs: MultisigListItemResponse[];
};

export function MultisigsTable({ multisigs }: MultisigsTableProps) {
	const [search, setSearch] = useState("");
	const [riskFilter, setRiskFilter] = useState<string>("All");
	const [page, setPage] = useState(0);

	const filtered = multisigs.filter((m) => {
		const matchesSearch =
			!search ||
			m.address.toLowerCase().includes(search.toLowerCase()) ||
			(m.label ?? "").toLowerCase().includes(search.toLowerCase());
		const matchesRisk =
			riskFilter === "All" ||
			(m.healthScore != null &&
				getLevel(m.healthScore) === riskFilter.toLowerCase());
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
		<>
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
				{/* Risk filter tabs */}
				<div className="flex flex-wrap items-center gap-2 pb-4 border-b border-border-subtle">
					{RISK_FILTERS.map((f) => (
						<button
							key={f}
							type="button"
							onClick={() => handleRiskFilter(f)}
							className={[
								"px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors rounded-md border",
								riskFilter === f
									? "bg-bg-raised text-text-primary border-border-default"
									: "text-text-tertiary hover:text-text-secondary border-transparent",
							].join(" ")}
						>
							{f}
						</button>
					))}
				</div>

				{/* Table header — desktop */}
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
						paginated.map((m, i) => {
							const level =
								m.healthScore != null ? getLevel(m.healthScore) : "unknown";

							return (
								<Link
									key={m.id}
									href={`/multisig/${m.address}`}
									className={[
										"flex items-center justify-between py-4 px-2 hover:bg-bg-hover transition-colors",
										i < paginated.length - 1
											? "border-b border-border-subtle"
											: "",
									].join(" ")}
								>
									{/* Mobile */}
									<div className="flex-1 min-w-0 md:hidden">
										<span className="font-mono text-md text-text-link truncate block">
											{m.address.slice(0, 8)}..{m.address.slice(-4)}
										</span>
										<span className="text-xs text-text-tertiary">
											{m.label ?? "—"} &middot;{" "}
											{m.threshold != null
												? `${m.threshold}/${m.totalSigners}`
												: "—"}
										</span>
									</div>

									{/* Desktop */}
									<span className="flex-1 min-w-0 font-mono text-md text-text-link truncate hidden md:block">
										{m.address.slice(0, 8)}..{m.address.slice(-4)}
									</span>
									<span className="w-36 text-left text-md text-text-secondary truncate hidden md:block">
										{m.label ?? "—"}
									</span>
									<span className="w-20 text-left font-mono text-md text-text-secondary hidden lg:block">
										{m.threshold != null
											? `${m.threshold}/${m.totalSigners}`
											: "—"}
									</span>
									<span className="w-16 text-right font-mono text-md text-text-primary hidden md:block">
										{m.healthScore ?? "—"}
									</span>
									<span className="w-24 flex justify-end shrink-0">
										<RiskBadge level={level} size="sm" />
									</span>
								</Link>
							);
						})
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
								onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
								disabled={page === totalPages - 1}
								className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-text-secondary disabled:text-text-disabled transition-colors"
							>
								Next
							</button>
						</div>
					</div>
				)}
			</Card>
		</>
	);
}
