"use client";

import { useState } from "react";
import { Card } from "@sentinel/ui";
import { ProposalRow } from "./ProposalRow";
import type { RiskLevel } from "@/lib/risk";
import { PROPOSAL_STATUSES, PAGE_SIZE } from "@/lib/constants";

type Proposal = {
	id: string;
	linkId: string;
	description: string;
	status: "Pending" | "Executed" | "Rejected";
	riskLevel: RiskLevel | null;
};

type ProposalHistoryProps = {
	proposals: Proposal[];
	pageSize?: number;
};

export function ProposalHistory({
	proposals,
	pageSize = PAGE_SIZE,
}: ProposalHistoryProps) {
	const [filter, setFilter] = useState<string>("All");
	const [page, setPage] = useState(0);

	const filtered =
		filter === "All" ? proposals : proposals.filter((p) => p.status === filter);
	const totalPages = Math.ceil(filtered.length / pageSize);
	const paginated = filtered.slice(page * pageSize, (page + 1) * pageSize);

	function handleFilterChange(status: string) {
		setFilter(status);
		setPage(0);
	}

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
			<div className="mt-1">
				{paginated.length === 0 ? (
					<p className="py-8 text-center text-text-tertiary text-sm">
						No proposals found
					</p>
				) : (
					paginated.map((p, i) => (
						<ProposalRow
							key={p.linkId}
							id={p.id}
							linkId={p.linkId}
							description={p.description}
							status={p.status}
							riskLevel={p.riskLevel}
							isLast={i === paginated.length - 1}
						/>
					))
				)}
			</div>
			{totalPages > 1 && (
				<div className="flex items-center justify-between pt-4 mt-2 border-t border-border-subtle">
					<span className="text-xs text-text-tertiary">
						{page * pageSize + 1}–
						{Math.min((page + 1) * pageSize, filtered.length)} of{" "}
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
	);
}
