import {
  MultisigHeader,
  InfoCard,
  ScoreCard,
  SignersList,
  ReportCard,
  ProposalHistory,
} from "@/components/multisig";

const MOCK_MULTISIG = {
  address: "7xK9f2qR8mNpL3wBvT5aB3qW5nR8kJ2",
  type: "Squads v4",
  threshold: { current: 3, total: 5 },
  created: "2026-01-15",
  lastActivity: "2 hours ago",
  score: 73,
};

const MOCK_SIGNERS = [
  {
    address: "3mQ7dL..zF1w",
    label: "Treasury Lead",
    status: "Active",
    riskLevel: "safe" as const,
  },
  {
    address: "9pR2vN..wK8e",
    label: "Dev Ops",
    status: "Active",
    riskLevel: "safe" as const,
  },
  {
    address: "5nL4cX..hG6y",
    label: "Contributor",
    status: "Inactive",
    riskLevel: "medium" as const,
  },
  {
    address: "2jM8bR..cD0r",
    label: "Founder",
    status: "Active",
    riskLevel: "safe" as const,
  },
  {
    address: "8tV6sK..pN2x",
    label: "Advisor",
    status: "Active",
    riskLevel: "low" as const,
  },
];

const MOCK_PROPOSALS = [
  {
    id: "#1247",
    description: "Transfer 500 SOL to external",
    status: "Pending" as const,
    riskLevel: "high" as const,
  },
  {
    id: "#1246",
    description: "Update upgrade authority",
    status: "Executed" as const,
    riskLevel: "safe" as const,
  },
  {
    id: "#1245",
    description: "Add new signer",
    status: "Executed" as const,
    riskLevel: "low" as const,
  },
  {
    id: "#1244",
    description: "Transfer 100 USDC",
    status: "Executed" as const,
    riskLevel: "safe" as const,
  },
  {
    id: "#1243",
    description: "Remove signer",
    status: "Rejected" as const,
    riskLevel: "critical" as const,
  },
  {
    id: "#1242",
    description: "Transfer 500 SOL to external",
    status: "Pending" as const,
    riskLevel: "high" as const,
  },
  {
    id: "#1241",
    description: "Update upgrade authority",
    status: "Executed" as const,
    riskLevel: "safe" as const,
  },
  {
    id: "#1240",
    description: "Add new signer",
    status: "Executed" as const,
    riskLevel: "low" as const,
  },
  {
    id: "#1239",
    description: "Transfer 100 USDC",
    status: "Executed" as const,
    riskLevel: "safe" as const,
  },
  {
    id: "#1238",
    description: "Remove signer",
    status: "Rejected" as const,
    riskLevel: "critical" as const,
  },
  {
    id: "#1237",
    description: "Transfer 500 SOL to external",
    status: "Pending" as const,
    riskLevel: "high" as const,
  },
  {
    id: "#1236",
    description: "Update upgrade authority",
    status: "Executed" as const,
    riskLevel: "safe" as const,
  },
  {
    id: "#1235",
    description: "Add new signer",
    status: "Executed" as const,
    riskLevel: "low" as const,
  },
  {
    id: "#1234",
    description: "Transfer 100 USDC",
    status: "Executed" as const,
    riskLevel: "safe" as const,
  },
  {
    id: "#1233",
    description: "Remove signer",
    status: "Rejected" as const,
    riskLevel: "critical" as const,
  },
  {
    id: "#1232",
    description: "Transfer 500 SOL to external",
    status: "Pending" as const,
    riskLevel: "high" as const,
  },
  {
    id: "#1231",
    description: "Update upgrade authority",
    status: "Executed" as const,
    riskLevel: "safe" as const,
  },
  {
    id: "#1230",
    description: "Add new signer",
    status: "Executed" as const,
    riskLevel: "low" as const,
  },
  {
    id: "#1229",
    description: "Transfer 100 USDC",
    status: "Executed" as const,
    riskLevel: "safe" as const,
  },
  {
    id: "#1228",
    description: "Remove signer",
    status: "Rejected" as const,
    riskLevel: "critical" as const,
  },
  { id: "#1227", description: "Transfer 2000 SOL to treasury", status: "Executed" as const, riskLevel: "safe" as const },
  { id: "#1226", description: "Set vault limit to 5000 SOL", status: "Executed" as const, riskLevel: "low" as const },
  { id: "#1225", description: "Rotate upgrade authority key", status: "Pending" as const, riskLevel: "high" as const },
  { id: "#1224", description: "Transfer 50 BONK to marketing", status: "Executed" as const, riskLevel: "safe" as const },
  { id: "#1223", description: "Add signer 0xF3..9a2B", status: "Executed" as const, riskLevel: "low" as const },
  { id: "#1222", description: "Remove inactive signer", status: "Rejected" as const, riskLevel: "critical" as const },
  { id: "#1221", description: "Transfer 800 USDC to dev fund", status: "Executed" as const, riskLevel: "safe" as const },
  { id: "#1220", description: "Update program to v2.1.0", status: "Executed" as const, riskLevel: "medium" as const },
  { id: "#1219", description: "Withdraw 300 SOL from vault", status: "Pending" as const, riskLevel: "high" as const },
  { id: "#1218", description: "Change threshold to 4 of 5", status: "Executed" as const, riskLevel: "low" as const },
  { id: "#1217", description: "Transfer 1500 SOL to staking", status: "Executed" as const, riskLevel: "safe" as const },
  { id: "#1216", description: "Revoke token delegate", status: "Executed" as const, riskLevel: "safe" as const },
  { id: "#1215", description: "Emergency pause protocol", status: "Rejected" as const, riskLevel: "critical" as const },
  { id: "#1214", description: "Transfer 200 USDT to ops", status: "Executed" as const, riskLevel: "safe" as const },
  { id: "#1213", description: "Add new program authority", status: "Pending" as const, riskLevel: "high" as const },
  { id: "#1212", description: "Transfer 75 SOL to contributor", status: "Executed" as const, riskLevel: "low" as const },
  { id: "#1211", description: "Update oracle feed address", status: "Executed" as const, riskLevel: "medium" as const },
  { id: "#1210", description: "Migrate liquidity to pool v3", status: "Executed" as const, riskLevel: "safe" as const },
  { id: "#1209", description: "Remove deprecated signer key", status: "Executed" as const, riskLevel: "low" as const },
  { id: "#1208", description: "Transfer 5000 SOL external", status: "Rejected" as const, riskLevel: "critical" as const },
  { id: "#1207", description: "Set fee collector address", status: "Executed" as const, riskLevel: "safe" as const },
  { id: "#1206", description: "Approve token mint increase", status: "Pending" as const, riskLevel: "high" as const },
  { id: "#1205", description: "Transfer 150 USDC to audit", status: "Executed" as const, riskLevel: "safe" as const },
  { id: "#1204", description: "Update multisig metadata", status: "Executed" as const, riskLevel: "low" as const },
  { id: "#1203", description: "Withdraw 600 SOL from reserve", status: "Executed" as const, riskLevel: "medium" as const },
  { id: "#1202", description: "Add backup signer key", status: "Executed" as const, riskLevel: "safe" as const },
  { id: "#1201", description: "Transfer 1000 SOL to bridge", status: "Pending" as const, riskLevel: "high" as const },
  { id: "#1200", description: "Revoke old program authority", status: "Executed" as const, riskLevel: "low" as const },
  { id: "#1199", description: "Emergency fund withdrawal", status: "Rejected" as const, riskLevel: "critical" as const },
  { id: "#1198", description: "Update governance parameters", status: "Executed" as const, riskLevel: "safe" as const },
];

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

        <SignersList signers={MOCK_SIGNERS} />

        <ReportCard />

        <ProposalHistory proposals={MOCK_PROPOSALS} />
      </div>
    </main>
  );
}
