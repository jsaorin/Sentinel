import {
	HeroSection,
	StatsSection,
	FeatureSection,
	TimelineSection,
	SectionDivider,
} from "@/components/landing";
import { Footer } from "@/components/Footer";

export default function HomePage() {
	return (
		<main className="min-h-screen">
			<TimelineSection>
				<HeroSection />
			</TimelineSection>

			<TimelineSection>
				<StatsSection />
			</TimelineSection>

			<SectionDivider />

			<TimelineSection>
				<FeatureSection
					label="Risk Scoring"
					title="Every Proposal, Scored Before You Sign"
					description="Sentinel assigns an AI-generated risk score from 0 to 100 for every multisig proposal. Transaction intent, parameter anomalies, historical attack patterns, and signer context are all weighed before a single key is pressed."
					visual="gauge"
				/>
			</TimelineSection>

			<SectionDivider />

			<TimelineSection>
				<FeatureSection
					reversed
					label="Signer Analysis"
					title="Know Your Signers, Trust the Pattern"
					description="Track signer behavior over time. Sentinel detects compromised keys, unusual signing cadences, and social engineering attempts targeting your multisig members. When a trusted signer starts acting differently, you'll know immediately."
					visual="network"
				/>
			</TimelineSection>

			<SectionDivider />

			<TimelineSection>
				<FeatureSection
					label="Nonce Detection"
					title="Catch the Attack That Drained $270M"
					description="Monitor for staged durable nonce transactions — the exact attack vector used in the Drift Protocol exploit. Sentinel alerts you when pre-signed transactions sit dormant, waiting to execute. Stop them before they drain your vault."
					visual="timeline"
				/>
			</TimelineSection>

			<Footer />
		</main>
	);
}
