"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, Badge, RiskBadge } from "@sentinel/ui";
import { SearchIcon } from "@/components/icons";
import { getRiskLevel } from "@/lib/risk";
import {
	PROPOSAL_STATUSES,
	PAGE_SIZE,
	STATUS_DISPLAY,
	STATUS_DISPLAY_VARIANT,
} from "@/lib/constants";
import type { GlobalProposalResponse, PaginationResponse } from "@/lib/api";

type ProposalsTableProps = {
	initialProposals: GlobalProposalResponse[];
	initialPagination: PaginationResponse;
};

export function ProposalsTable({
	initialProposals,
	initialPagination,
}: ProposalsTableProps) {
	const [proposals, setProposals] = useState(initialProposals);
	const [pagination, setPagination] = useState(initialPagination);
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("All");
	const [loading, setLoading] = useState(false);

	async function fetchPage(page: number) {
		setLoading(true);
		try {
			const { getAllProposals } = await import("@/lib/api");
			const result = await getAllProposals(page, PAGE_SIZE);
			setProposals(result.proposals);
			setPagination(result.pagination);
		} catch {
			/* keep current data */
		} finally {
			setLoading(false);
		}
	}

	function handleSearchChange(value: string) {
		setSearch(value);
	}

	function handleStatusFilter(status: string) {
		setStatusFilter(status);
	}

	const filtered = proposals.filter((p) => {
		const displayStatus = STATUS_DISPLAY[p.status] ?? "Pending";
		const matchesStatus =
			statusFilter === "All" || displayStatus === statusFilter;
		const matchesSearch =
			!search ||
			String(p.proposalIndex).includes(search) ||
			(p.multisig.label ?? "").toLowerCase().includes(search.toLowerCase()) ||
			p.multisig.address.toLowerCase().includes(search.toLowerCase());
		return matchesStatus && matchesSearch;
	});

	return (
		<>
			{/* Search */}
			<div className="flex items-center gap-2 bg-bg-card border border-border-default rounded-md p-2 mb-6 max-w-xl mx-auto focus-within:border-border-strong transition-colors">
				<SearchIcon className="w-5 h-5 text-text-tertiary shrink-0 ml-2" />
				<input
					type="text"
					value={search}
					onChange={(e) => handleSearchChange(e.target.value)}
					placeholder="Search by proposal # or multisig..."
					className="flex-1 bg-transparent py-2 text-text-primary font-mono placeholder:text-text-tertiary focus:outline-none text-md"
				/>
			</div>

			<Card variant="default" padding="lg">
				{/* Status filters */}
				<div className="flex flex-wrap items-center gap-2 pb-4 border-b border-border-subtle">
					{PROPOSAL_STATUSES.map((s) => (
						<button
							key={s}
							type="button"
							onClick={() => handleStatusFilter(s)}
							className={[
								"px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors rounded-md border",
								statusFilter === s
									? "bg-bg-raised text-text-primary border-border-default"
									: "text-text-tertiary hover:text-text-secondary border-transparent",
							].join(" ")}
						>
							{s}
						</button>
					))}
				</div>

				{/* Table header */}
				<div className="hidden md:flex items-center py-3 px-2 text-xs uppercase tracking-wider font-semibold text-text-tertiary border-b border-border-subtle">
					<span className="w-20">Proposal</span>
					<span className="flex-1 min-w-0">Summary</span>
					<span className="w-40 text-left">Multisig</span>
					<span className="w-24 text-center">Status</span>
					<span className="w-24 text-right">Risk</span>
				</div>

				{/* Rows */}
				<div className={loading ? "opacity-50 pointer-events-none" : ""}>
					{filtered.length === 0 ? (
						<p className="py-12 text-center text-text-tertiary text-sm">
							No proposals found
						</p>
					) : (
						filtered.map((p, i) => {
							const displayStatus = (STATUS_DISPLAY[p.status] ?? "Pending") as
								| "Pending"
								| "Executed"
								| "Rejected";
							const riskLevel =
								p.riskScore != null ? getRiskLevel(p.riskScore) : null;

							return (
								<Link
									key={p.id}
									href={`/proposal/${p.id}`}
									className={[
										"flex items-center justify-between py-4 px-2 hover:bg-bg-hover transition-colors",
										i < filtered.length - 1
											? "border-b border-border-subtle"
											: "",
									].join(" ")}
								>
									{/* Mobile */}
									<div className="flex-1 min-w-0 md:hidden">
										<span className="font-mono text-md text-text-link block">
											#{p.proposalIndex}
										</span>
										<span className="text-xs text-text-tertiary">
											{p.multisig.label ??
												`${p.multisig.address.slice(0, 4)}...${p.multisig.address.slice(-4)}`}
										</span>
									</div>

									{/* Desktop */}
									<span className="w-20 font-mono text-md text-text-link hidden md:block">
										#{p.proposalIndex}
									</span>
									<span className="flex-1 min-w-0 text-md text-text-secondary truncate hidden md:block">
										{p.summary ?? "—"}
									</span>
									<span className="w-40 text-left text-md text-text-secondary truncate hidden md:block">
										{p.multisig.label ??
											`${p.multisig.address.slice(0, 4)}...${p.multisig.address.slice(-4)}`}
									</span>
									<span className="w-24 hidden md:flex justify-center">
										<Badge variant={STATUS_DISPLAY_VARIANT[displayStatus]}>
											{displayStatus}
										</Badge>
									</span>
									<span className="w-24 flex justify-end shrink-0">
										<RiskBadge level={riskLevel ?? "unknown"} size="sm" />
									</span>
								</Link>
							);
						})
					)}
				</div>

				{/* Pagination */}
				{pagination.totalPages > 1 && (
					<div className="flex items-center justify-between pt-4 mt-2 border-t border-border-subtle">
						<span className="text-xs text-text-tertiary">
							Page {pagination.page} of {pagination.totalPages} (
							{pagination.total} total)
						</span>
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={() => fetchPage(pagination.page - 1)}
								disabled={pagination.page <= 1 || loading}
								className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-text-secondary disabled:text-text-disabled transition-colors"
							>
								Prev
							</button>
							<span className="text-xs text-text-secondary font-mono">
								{pagination.page}/{pagination.totalPages}
							</span>
							<button
								type="button"
								onClick={() => fetchPage(pagination.page + 1)}
								disabled={pagination.page >= pagination.totalPages || loading}
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
