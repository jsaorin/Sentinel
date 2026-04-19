import Link from "next/link";
import { Badge, RiskBadge } from "@sentinel/ui";
import type { RiskLevel } from "@/lib/risk";

type ProposalRowProps = {
	id: string;
	linkId: string;
	description: string;
	status: "Pending" | "Executed" | "Rejected";
	riskLevel: RiskLevel | null;
	isLast?: boolean;
};

const statusVariant: Record<string, "medium" | "safe" | "critical"> = {
	Pending: "medium",
	Executed: "safe",
	Rejected: "critical",
};

export function ProposalRow({
	id,
	linkId,
	description,
	status,
	riskLevel,
	isLast = false,
}: ProposalRowProps) {
	return (
		<Link
			href={`/proposal/${linkId}`}
			className={[
				"flex items-center justify-between py-4 px-2 hover:bg-bg-hover transition-colors cursor-pointer",
				!isLast ? "border-b border-border-subtle" : "",
			].join(" ")}
		>
			<div className="flex items-center gap-4 min-w-0">
				<span className="font-mono text-md text-text-primary shrink-0">
					{id}
				</span>
				<span className="text-md text-text-secondary truncate">
					{description}
				</span>
			</div>
			<div className="flex items-center gap-4 shrink-0">
				<Badge variant={statusVariant[status]} className="w-24 justify-start">
					{status}
				</Badge>
				<RiskBadge level={riskLevel ?? "unknown"} size="sm" className="w-20 justify-start" />
			</div>
		</Link>
	);
}
