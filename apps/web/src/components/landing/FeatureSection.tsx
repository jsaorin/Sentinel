import { FeatureVisual } from "./FeatureVisual";

type FeatureSectionProps = {
  label: string;
  title: string;
  description: string;
  visual: "gauge" | "network" | "timeline";
  reversed?: boolean;
};

export function FeatureSection({
  label,
  title,
  description,
  visual,
  reversed = false,
}: FeatureSectionProps) {
  return (
    <section className="max-w-6xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className={reversed ? "md:order-last" : ""}>
          <span className="text-sm uppercase tracking-widest text-primary font-semibold">
            {label}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold leading-tight mt-3">
            {title}
          </h2>
          <p className="text-lg text-text-secondary mt-4 leading-relaxed">
            {description}
          </p>
        </div>
        <div className={reversed ? "md:order-first" : ""}>
          <FeatureVisual variant={visual} />
        </div>
      </div>
    </section>
  );
}
