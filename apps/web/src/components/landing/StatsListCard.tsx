import type { ReactNode } from "react";
import { Card } from "@sentinel/ui";
import { ArrowRightIcon } from "@/components/icons";

type StatsListCardProps = {
	title: string;
	children: ReactNode;
	viewAllLabel: string;
	viewAllHref: string;
};

export function StatsListCard({ title, children, viewAllLabel, viewAllHref }: StatsListCardProps) {
	return (
		<Card variant="default" padding="sm">
			<div className="flex items-center justify-between px-3 pt-2 pb-3 border-b border-border-subtle">
				<h3 className="text-lg font-semibold">{title}</h3>
			</div>
			<div className="px-2">{children}</div>
			<div className="border-t border-border-subtle mt-1 py-3">
				<a
					href={viewAllHref}
					className="flex items-center justify-center gap-1.5 text-sm text-text-link uppercase tracking-wider font-semibold hover:text-text-link-hover transition-colors"
				>
					{viewAllLabel}
					<ArrowRightIcon className="w-3.5 h-3.5" />
				</a>
			</div>
		</Card>
	);
}
