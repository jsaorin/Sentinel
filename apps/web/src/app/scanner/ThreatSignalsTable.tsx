"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, Badge } from "@sentinel/ui";
import { SearchIcon } from "@/components/icons";
import {
	THREAT_SOURCE_FILTERS,
	PAGE_SIZE,
	SOURCE_KIND_LABEL,
	CATEGORY_LABEL,
	SEVERITY_VARIANT,
	SEVERITY_LABEL,
} from "@/lib/constants";
import type {
	ThreatSignalListItemResponse,
	PaginationResponse,
} from "@/lib/api";

type ThreatSignalsTableProps = {
	initialItems: ThreatSignalListItemResponse[];
	initialPagination: PaginationResponse;
	refreshKey: number;
};

function formatRelativeTime(iso: string): string {
	const diff = Date.now() - new Date(iso).getTime();
	const seconds = Math.floor(diff / 1000);
	if (seconds < 60) return `${seconds}s ago`;
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	return `${days}d ago`;
}

export function ThreatSignalsTable({
	initialItems,
	initialPagination,
	refreshKey,
}: ThreatSignalsTableProps) {
	const [items, setItems] = useState(initialItems);
	const [pagination, setPagination] = useState(initialPagination);
	const [search, setSearch] = useState("");
	const [sourceFilter, setSourceFilter] = useState<string>("All");
	const [loading, setLoading] = useState(false);

	const fetchPage = useCallback(
		async (page: number) => {
			setLoading(true);
			try {
				const { getThreatSignals } = await import("@/lib/api");
				const sourceKind =
					sourceFilter !== "All"
						? (sourceFilter.toLowerCase() as "telegram" | "twitter" | "rss")
						: undefined;
				const result = await getThreatSignals({
					page,
					pageSize: PAGE_SIZE,
					isThreat: true,
					sortBy: "capturedAt",
					sortOrder: "desc",
					sourceKind,
				});
				setItems(result.items);
				setPagination(result.pagination);
			} catch {
				/* keep current data */
			} finally {
				setLoading(false);
			}
		},
		[sourceFilter],
	);

	useEffect(() => {
		if (refreshKey > 0) {
			fetchPage(1);
		}
	}, [refreshKey, fetchPage]);

	const filtered = items.filter((s) => {
		const matchesSearch =
			!search ||
			(s.summary ?? "").toLowerCase().includes(search.toLowerCase()) ||
			(s.sourceLabel ?? "").toLowerCase().includes(search.toLowerCase()) ||
			(s.category ?? "").toLowerCase().includes(search.toLowerCase());
		return matchesSearch;
	});

	return (
		<>
			{/* Search */}
			<div className="flex items-center gap-2 bg-bg-card border border-border-default rounded-md p-2 mb-6 focus-within:border-border-strong transition-colors">
				<SearchIcon className="w-5 h-5 text-text-tertiary shrink-0 ml-2" />
				<input
					type="text"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search by summary, source, or category..."
					className="flex-1 bg-transparent py-2 text-text-primary font-mono placeholder:text-text-tertiary focus:outline-none text-md"
				/>
			</div>

			<Card variant="default" padding="lg">
				{/* Source filters */}
				<div className="flex flex-wrap items-center gap-2 pb-4 border-b border-border-subtle">
					{THREAT_SOURCE_FILTERS.map((s) => (
						<button
							key={s}
							type="button"
							onClick={() => {
								setSourceFilter(s);
								if (s !== sourceFilter) fetchPage(1);
							}}
							className={[
								"px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors rounded-md border",
								sourceFilter === s
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
					<span className="w-28">Time</span>
					<span className="flex-1 min-w-0">Summary</span>
					<span className="w-24 text-center">Source</span>
					<span className="w-32 text-center">Category</span>
					<span className="w-24 text-right">Severity</span>
				</div>

				{/* Rows */}
				<div className={loading ? "opacity-50 pointer-events-none" : ""}>
					{filtered.length === 0 ? (
						<p className="py-12 text-center text-text-tertiary text-sm">
							No threat signals found
						</p>
					) : (
						filtered.map((s, i) => {
							const severity = s.severity
								? SEVERITY_VARIANT[s.severity]
								: undefined;

							const row = (
								<div
									key={s.id}
									className={[
										"flex items-center justify-between py-4 px-2 hover:bg-bg-hover transition-colors",
										i < filtered.length - 1
											? "border-b border-border-subtle"
											: "",
									].join(" ")}
								>
									{/* Mobile */}
									<div className="flex-1 min-w-0 md:hidden">
										<span className="font-mono text-xs text-text-tertiary block">
											{formatRelativeTime(s.capturedAt)}
										</span>
										<span className="text-md text-text-secondary block truncate mt-1">
											{s.summary ?? "Analyzing..."}
										</span>
										<div className="flex items-center gap-2 mt-1">
											{s.sourceKind && (
												<Badge variant="info">
													{SOURCE_KIND_LABEL[s.sourceKind] ?? s.sourceKind}
												</Badge>
											)}
											{severity && (
												<Badge variant={severity}>
													{SEVERITY_LABEL[s.severity!] ?? s.severity}
												</Badge>
											)}
										</div>
									</div>

									{/* Desktop */}
									<span className="w-28 font-mono text-xs text-text-tertiary hidden md:block">
										{formatRelativeTime(s.capturedAt)}
									</span>
									<span className="flex-1 min-w-0 text-md text-text-secondary truncate hidden md:block">
										{s.summary ?? "Analyzing..."}
									</span>
									<span className="w-24 hidden md:flex justify-center">
										<Badge variant="info">
											{SOURCE_KIND_LABEL[s.sourceKind] ?? s.sourceKind}
										</Badge>
									</span>
									<span className="w-32 hidden md:flex justify-center">
										{s.category ? (
											<Badge variant="unknown">
												{CATEGORY_LABEL[s.category] ?? s.category}
											</Badge>
										) : (
											<span className="text-xs text-text-tertiary">—</span>
										)}
									</span>
									<span className="w-24 hidden md:flex justify-end">
										{severity ? (
											<Badge variant={severity}>
												{SEVERITY_LABEL[s.severity!] ?? s.severity}
											</Badge>
										) : (
											<span className="text-xs text-text-tertiary">—</span>
										)}
									</span>
								</div>
							);

							if (s.sourceUrl) {
								return (
									<a
										key={s.id}
										href={s.sourceUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="block"
									>
										{row}
									</a>
								);
							}

							return row;
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
