import { Badge, RiskBadge } from "@sentinel/ui";

type RiskLevel = "critical" | "high" | "medium" | "low" | "safe" | "info" | "unknown";

type ProposalRowProps = {
	id: string;
	description: string;
	status: "Pending" | "Executed" | "Rejected";
	riskLevel: RiskLevel;
	isLast?: boolean;
};

const statusVariant: Record<string, "medium" | "safe" | "critical"> = {
	Pending: "medium",
	Executed: "safe",
	Rejected: "critical",
};

export function ProposalRow({ id, description, status, riskLevel, isLast = false }: ProposalRowProps) {
	return (
		<div
			className={[
				"flex items-center justify-between py-4 px-2",
				!isLast ? "border-b border-border-subtle" : "",
			].join(" ")}
		>
			<div className="flex items-center gap-4 min-w-0">
				<span className="font-mono text-md text-text-primary shrink-0">{id}</span>
				<span className="text-md text-text-secondary truncate">{description}</span>
			</div>
			<div className="flex items-center gap-4 shrink-0">
				<Badge variant={statusVariant[status]} className="w-24 justify-center">{status}</Badge>
				<RiskBadge level={riskLevel} size="sm" className="w-20 justify-center" />
			</div>
		</div>
	);
}
