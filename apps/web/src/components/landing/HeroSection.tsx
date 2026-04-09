import { SearchBar } from "./SearchBar";
import { HeroVisual } from "./HeroVisual";
import { ScrollIndicator } from "./ScrollIndicator";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="relative z-10 py-20 md:py-0">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            <span className="text-white">Sentinel</span>
            <br />
            <span className="text-text-primary">
              AI-Powered Multisig Security
            </span>
          </h1>
          <p className="text-lg text-text-secondary mt-4 leading-relaxed max-w-xl">
            Score every proposal. Detect signer anomalies. Catch durable nonce
            attacks before they drain your protocol.
          </p>
          <SearchBar />
        </div>
        <HeroVisual />
      </div>
      <ScrollIndicator />
    </section>
  );
}
