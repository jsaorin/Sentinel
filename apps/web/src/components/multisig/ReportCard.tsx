import { Card } from "@sentinel/ui";

type ReportCardProps = {
	title?: string;
	content?: string | null;
};

export function ReportCard({
	title = "Security Report",
	content,
}: ReportCardProps) {
	return (
		<Card variant="raised" padding="lg">
			<h3 className="text-lg font-semibold pb-4 border-b border-border-subtle">
				{title}
			</h3>
			<p className="text-text-secondary text-md mt-4 leading-relaxed">
				{content ?? "Analysis unavailable"}
			</p>
		</Card>
	);
}
