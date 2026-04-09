import { ScoreGauge } from "@sentinel/ui";

type ScoreCardProps = {
	score: number;
};

export function ScoreCard({ score }: ScoreCardProps) {
	return (
		<div className="flex items-center justify-center py-6 md:py-0">
			<ScoreGauge score={score} size="lg" />
		</div>
	);
}
