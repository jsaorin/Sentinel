"use client";

import { useState, useCallback } from "react";
import { Card } from "@sentinel/ui";
import { ProposalRow } from "./ProposalRow";
import type { RiskLevel } from "@/lib/risk";
import { getRiskLevel } from "@/lib/risk";
import { PROPOSAL_STATUSES, PAGE_SIZE, STATUS_DISPLAY } from "@/lib/constants";
import type { PaginatedProposalsResponse } from "@/lib/api";

type Proposal = {
	id: string;
	linkId: string;
	description: string;
	status: "Pending" | "Executed" | "Rejected";
	riskLevel: RiskLevel | null;
};

type ProposalHistoryProps = {
	address: string;
	initialProposals: Proposal[];
	totalProposals: number;
	totalPages: number;
};

function mapProposals(
	raw: PaginatedProposalsResponse["proposals"],
): Proposal[] {
	return raw.map((p) => ({
		id: `#${p.proposalIndex}`,
		linkId: p.id,
		description:
			p.summary ??
			(p.instructions.length > 0
				? `${p.instructions.length} instruction${p.instructions.length > 1 ? "s" : ""}`
				: "Empty proposal"),
		status: (STATUS_DISPLAY[p.status] ?? "Pending") as
			| "Pending"
			| "Executed"
			| "Rejected",
		riskLevel: p.riskScore != null ? getRiskLevel(p.riskScore) : null,
	}));
}

export function ProposalHistory({
	address,
	initialProposals,
	totalProposals,
	totalPages: initialTotalPages,
}: ProposalHistoryProps) {
	const [proposals, setProposals] = useState<Proposal[]>(initialProposals);
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(totalProposals);
	const [totalPages, setTotalPages] = useState(initialTotalPages);
	const [filter, setFilter] = useState<string>("All");
	const [loading, setLoading] = useState(false);

	const fetchPage = useCallback(
		async (newPage: number) => {
			setLoading(true);
			try {
				const API_BASE =
					process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
				const res = await fetch(
					`${API_BASE}/multisigs/${address}/proposals?page=${newPage}&pageSize=${PAGE_SIZE}`,
				);
				if (!res.ok) throw new Error("Failed");
				const json = await res.json();
				const data: PaginatedProposalsResponse = json.data;
				setProposals(mapProposals(data.proposals));
				setTotal(data.pagination.total);
				setTotalPages(data.pagination.totalPages);
				setPage(newPage);
			} catch {
				/* keep current data on error */
			} finally {
				setLoading(false);
			}
		},
		[address],
	);

	function handleFilterChange(status: string) {
		setFilter(status);
	}

	const filtered =
		filter === "All" ? proposals : proposals.filter((p) => p.status === filter);

	return (
		<Card variant="default" padding="lg">
			<div className="pb-4 border-b border-border-subtle">
				<h3 className="text-lg font-semibold">Proposals</h3>
				<div className="flex flex-wrap items-center gap-2 mt-3">
					{PROPOSAL_STATUSES.map((status) => (
						<button
							key={status}
							type="button"
							onClick={() => handleFilterChange(status)}
							className={[
								"px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors rounded-md border",
								filter === status
									? "bg-bg-raised text-text-primary border-border-default"
									: "text-text-tertiary hover:text-text-secondary border-transparent",
							].join(" ")}
						>
							{status}
						</button>
					))}
				</div>
			</div>
			<div
				className={`mt-1 ${loading ? "opacity-50 pointer-events-none" : ""}`}
			>
				{filtered.length === 0 ? (
					<p className="py-8 text-center text-text-tertiary text-sm">
						No proposals found
					</p>
				) : (
					filtered.map((p, i) => (
						<ProposalRow
							key={p.linkId}
							id={p.id}
							linkId={p.linkId}
							description={p.description}
							status={p.status}
							riskLevel={p.riskLevel}
							isLast={i === filtered.length - 1}
						/>
					))
				)}
			</div>
			{totalPages > 1 && (
				<div className="flex items-center justify-between pt-4 mt-2 border-t border-border-subtle">
					<span className="text-xs text-text-tertiary">
						Page {page} of {totalPages} ({total} total)
					</span>
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => fetchPage(page - 1)}
							disabled={page <= 1 || loading}
							className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-text-secondary disabled:text-text-disabled transition-colors"
						>
							Prev
						</button>
						<span className="text-xs text-text-secondary font-mono">
							{page}/{totalPages}
						</span>
						<button
							type="button"
							onClick={() => fetchPage(page + 1)}
							disabled={page >= totalPages || loading}
							className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-text-secondary disabled:text-text-disabled transition-colors"
						>
							Next
						</button>
					</div>
				</div>
			)}
		</Card>
	);
}
