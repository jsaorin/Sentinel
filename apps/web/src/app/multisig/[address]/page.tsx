import type { Metadata } from "next";
import {
  MultisigHeader,
  InfoCard,
  ScoreCard,
  SignersList,
  ReportCard,
  ProposalHistory,
  BalanceCard,
} from "@/components/multisig";
import {
  MOCK_MULTISIG,
  MOCK_SIGNERS,
  MOCK_PROPOSALS,
} from "@/lib/mock-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ address: string }>;
}): Promise<Metadata> {
  const { address } = await params;
  return {
    title: `Multisig ${address.slice(0, 8)}...`,
    description: `Security report for Solana multisig ${address}. Risk score, signer analysis, and proposal history.`,
  };
}

export default function MultisigPage() {
  return (
    <main className="min-h-screen pb-16">
      <MultisigHeader />

      <div className="max-w-6xl mx-auto px-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <InfoCard
              address={MOCK_MULTISIG.address}
              type={MOCK_MULTISIG.type}
              threshold={MOCK_MULTISIG.threshold}
              created={MOCK_MULTISIG.created}
              lastActivity={MOCK_MULTISIG.lastActivity}
              score={MOCK_MULTISIG.score}
            />
          </div>
          <ScoreCard score={MOCK_MULTISIG.score} />
        </div>

        <BalanceCard address={MOCK_MULTISIG.address} />

        <SignersList signers={MOCK_SIGNERS} />

        <ReportCard />

        <ProposalHistory proposals={MOCK_PROPOSALS} />
      </div>
    </main>
  );
}
