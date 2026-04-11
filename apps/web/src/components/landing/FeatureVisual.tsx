import { NetworkVisual } from "./visuals/NetworkVisual";
import { TimelineVisual } from "./visuals/TimelineVisual";
import { ScoringVisual } from "./visuals/ScoringVisual";

type FeatureVisualProps = {
	variant: "gauge" | "network" | "timeline";
};

export function FeatureVisual({ variant }: FeatureVisualProps) {
	return (
		<div className="flex items-center justify-center p-6">
			{variant === "gauge" && <ScoringVisual />}
			{variant === "network" && <NetworkVisual />}
			{variant === "timeline" && <TimelineVisual />}
		</div>
	);
}
