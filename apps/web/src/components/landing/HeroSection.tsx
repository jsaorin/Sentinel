import { SearchBar } from "./SearchBar";
import { HeroVisual } from "./HeroVisual";
import { ScrollIndicator } from "./ScrollIndicator";

export function HeroSection() {
  return (
    <section className="relative min-h-[calc(100svh-4rem)] md:min-h-screen flex flex-col overflow-hidden">
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start md:items-center">
        <div className="flex-col my-auto z-10 md:pt-0 md:py-0">
          <h1 className="mt-3 leading-tight pt-20">
            <span
              className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent block font-display"
              style={{
                backgroundImage: "linear-gradient(to right, #ffffff, #666666)",
              }}
            >
              Sentinel
            </span>
            <span className="text-2xl md:text-3xl font-normal text-text-secondary block my-4">
              AI-Powered Multisig Security
            </span>
          </h1>
          <p className="text-lg text-text-tertiary mt-4 leading-relaxed max-w-xl">
            Score every proposal. Detect signer anomalies. Catch durable nonce
            attacks before they drain your protocol.
          </p>
          <SearchBar />
        </div>
        <HeroVisual />
        {/* Left gradient overlay — keeps text area clean when mesh extends behind */}
        <div
          className="absolute inset-0 pointer-events-none z-[5] hidden lg:block"
          style={{
            background:
              "linear-gradient(to right, black 0%, black 25%, transparent 55%)",
          }}
        />
      </div>
    </section>
  );
}
