import type { RiskLevel } from "@/lib/risk";

/* ───────────────────────────────────────────────────────────
 * Multisig detail page  (multisig/[address]/page.tsx)
 * ─────────────────────────────────────────────────────────── */

export const MOCK_MULTISIG = {
  address: "7gYJPNhRsyuiFWTr9apSUqbBHTNVV3bfya4RoHwbD6vp",
  type: "Squads v4",
  threshold: { current: 3, total: 5 },
  created: "2026-01-15",
  lastActivity: "2 hours ago",
  score: 73,
};

type MockSigner = {
	address: string;
	label: string;
	status: string;
	riskLevel: RiskLevel;
};

export const MOCK_SIGNERS: MockSigner[] = [
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

type MockProposal = {
	id: string;
	description: string;
	status: "Pending" | "Executed" | "Rejected";
	riskLevel: RiskLevel;
};

export const MOCK_PROPOSALS: MockProposal[] = [
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
  {
    id: "#1227",
    description: "Transfer 2000 SOL to treasury",
    status: "Executed" as const,
    riskLevel: "safe" as const,
  },
  {
    id: "#1226",
    description: "Set vault limit to 5000 SOL",
    status: "Executed" as const,
    riskLevel: "low" as const,
  },
  {
    id: "#1225",
    description: "Rotate upgrade authority key",
    status: "Pending" as const,
    riskLevel: "high" as const,
  },
  {
    id: "#1224",
    description: "Transfer 50 BONK to marketing",
    status: "Executed" as const,
    riskLevel: "safe" as const,
  },
  {
    id: "#1223",
    description: "Add signer 0xF3..9a2B",
    status: "Executed" as const,
    riskLevel: "low" as const,
  },
  {
    id: "#1222",
    description: "Remove inactive signer",
    status: "Rejected" as const,
    riskLevel: "critical" as const,
  },
  {
    id: "#1221",
    description: "Transfer 800 USDC to dev fund",
    status: "Executed" as const,
    riskLevel: "safe" as const,
  },
  {
    id: "#1220",
    description: "Update program to v2.1.0",
    status: "Executed" as const,
    riskLevel: "medium" as const,
  },
  {
    id: "#1219",
    description: "Withdraw 300 SOL from vault",
    status: "Pending" as const,
    riskLevel: "high" as const,
  },
  {
    id: "#1218",
    description: "Change threshold to 4 of 5",
    status: "Executed" as const,
    riskLevel: "low" as const,
  },
  {
    id: "#1217",
    description: "Transfer 1500 SOL to staking",
    status: "Executed" as const,
    riskLevel: "safe" as const,
  },
  {
    id: "#1216",
    description: "Revoke token delegate",
    status: "Executed" as const,
    riskLevel: "safe" as const,
  },
  {
    id: "#1215",
    description: "Emergency pause protocol",
    status: "Rejected" as const,
    riskLevel: "critical" as const,
  },
  {
    id: "#1214",
    description: "Transfer 200 USDT to ops",
    status: "Executed" as const,
    riskLevel: "safe" as const,
  },
  {
    id: "#1213",
    description: "Add new program authority",
    status: "Pending" as const,
    riskLevel: "high" as const,
  },
  {
    id: "#1212",
    description: "Transfer 75 SOL to contributor",
    status: "Executed" as const,
    riskLevel: "low" as const,
  },
  {
    id: "#1211",
    description: "Update oracle feed address",
    status: "Executed" as const,
    riskLevel: "medium" as const,
  },
  {
    id: "#1210",
    description: "Migrate liquidity to pool v3",
    status: "Executed" as const,
    riskLevel: "safe" as const,
  },
  {
    id: "#1209",
    description: "Remove deprecated signer key",
    status: "Executed" as const,
    riskLevel: "low" as const,
  },
  {
    id: "#1208",
    description: "Transfer 5000 SOL external",
    status: "Rejected" as const,
    riskLevel: "critical" as const,
  },
  {
    id: "#1207",
    description: "Set fee collector address",
    status: "Executed" as const,
    riskLevel: "safe" as const,
  },
  {
    id: "#1206",
    description: "Approve token mint increase",
    status: "Pending" as const,
    riskLevel: "high" as const,
  },
  {
    id: "#1205",
    description: "Transfer 150 USDC to audit",
    status: "Executed" as const,
    riskLevel: "safe" as const,
  },
  {
    id: "#1204",
    description: "Update multisig metadata",
    status: "Executed" as const,
    riskLevel: "low" as const,
  },
  {
    id: "#1203",
    description: "Withdraw 600 SOL from reserve",
    status: "Executed" as const,
    riskLevel: "medium" as const,
  },
  {
    id: "#1202",
    description: "Add backup signer key",
    status: "Executed" as const,
    riskLevel: "safe" as const,
  },
  {
    id: "#1201",
    description: "Transfer 1000 SOL to bridge",
    status: "Pending" as const,
    riskLevel: "high" as const,
  },
  {
    id: "#1200",
    description: "Revoke old program authority",
    status: "Executed" as const,
    riskLevel: "low" as const,
  },
  {
    id: "#1199",
    description: "Emergency fund withdrawal",
    status: "Rejected" as const,
    riskLevel: "critical" as const,
  },
  {
    id: "#1198",
    description: "Update governance parameters",
    status: "Executed" as const,
    riskLevel: "safe" as const,
  },
];

/* ───────────────────────────────────────────────────────────
 * Multisigs list page  (multisigs/page.tsx)
 * ─────────────────────────────────────────────────────────── */

export type Multisig = {
  address: string;
  label: string;
  threshold: { current: number; total: number };
  score: number;
  riskLevel: RiskLevel;
  lastActivity: string;
};

export const MOCK_MULTISIGS: Multisig[] = [
  {
    address: "7gYJPNhRsyuiFWTr9apSUqbBHTNVV3bfya4RoHwbD6vp",
    label: "Drift Protocol",
    threshold: { current: 3, total: 5 },
    score: 73,
    riskLevel: "low",
    lastActivity: "2 min ago",
  },
  {
    address: "3mQ7dL8kR9pN2wBvT5zF1w",
    label: "Marinade Finance",
    threshold: { current: 2, total: 3 },
    score: 12,
    riskLevel: "critical",
    lastActivity: "5 min ago",
  },
  {
    address: "9pR2vN5cX8hG6yL4wK8e",
    label: "Jupiter Exchange",
    threshold: { current: 4, total: 7 },
    score: 51,
    riskLevel: "medium",
    lastActivity: "12 min ago",
  },
  {
    address: "5nL4cX7bR2hG6yK8pN1w",
    label: "Tensor NFT",
    threshold: { current: 2, total: 5 },
    score: 85,
    riskLevel: "safe",
    lastActivity: "18 min ago",
  },
  {
    address: "2jM8bR4cD0rK7nL3pQ5x",
    label: "Raydium",
    threshold: { current: 3, total: 5 },
    score: 34,
    riskLevel: "high",
    lastActivity: "27 min ago",
  },
  {
    address: "8tV6sK9pN2xR4wL7mB3q",
    label: "Orca",
    threshold: { current: 5, total: 9 },
    score: 67,
    riskLevel: "low",
    lastActivity: "34 min ago",
  },
  {
    address: "4kR9mN3xL7bV2pT5wQ8y",
    label: "Jito Labs",
    threshold: { current: 3, total: 5 },
    score: 91,
    riskLevel: "safe",
    lastActivity: "1 hr ago",
  },
  {
    address: "6fH2jW5kR8mN1pL4xB7v",
    label: "Marginfi",
    threshold: { current: 2, total: 4 },
    score: 45,
    riskLevel: "medium",
    lastActivity: "1 hr ago",
  },
  {
    address: "1aD3eG6hJ9kL2mN5pQ8r",
    label: "Phantom Treasury",
    threshold: { current: 4, total: 6 },
    score: 88,
    riskLevel: "safe",
    lastActivity: "2 hr ago",
  },
  {
    address: "7bE4fH8iK1lM3nO6pR9s",
    label: "Solend",
    threshold: { current: 2, total: 3 },
    score: 29,
    riskLevel: "high",
    lastActivity: "2 hr ago",
  },
  {
    address: "2cF5gI9jL2mN4oP7qS0t",
    label: "Kamino Finance",
    threshold: { current: 3, total: 5 },
    score: 62,
    riskLevel: "low",
    lastActivity: "3 hr ago",
  },
  {
    address: "8dG6hJ0kM3nO5pQ8rT1u",
    label: "Helium Foundation",
    threshold: { current: 5, total: 7 },
    score: 78,
    riskLevel: "low",
    lastActivity: "3 hr ago",
  },
  {
    address: "3eH7iK1lN4oP6qR9sU2v",
    label: "Pyth Network",
    threshold: { current: 3, total: 5 },
    score: 82,
    riskLevel: "safe",
    lastActivity: "4 hr ago",
  },
  {
    address: "9fI8jL2mO5pQ7rS0tV3w",
    label: "Wormhole",
    threshold: { current: 4, total: 6 },
    score: 15,
    riskLevel: "critical",
    lastActivity: "5 hr ago",
  },
  {
    address: "4gJ9kM3nP6qR8sT1uW4x",
    label: "Mango Markets",
    threshold: { current: 2, total: 5 },
    score: 38,
    riskLevel: "high",
    lastActivity: "6 hr ago",
  },
  {
    address: "0hK0lN4oQ7rS9tU2vX5y",
    label: "Squads Treasury",
    threshold: { current: 3, total: 3 },
    score: 95,
    riskLevel: "safe",
    lastActivity: "7 hr ago",
  },
  {
    address: "5iL1mO5pR8sT0uV3wY6z",
    label: "Star Atlas",
    threshold: { current: 2, total: 4 },
    score: 56,
    riskLevel: "medium",
    lastActivity: "8 hr ago",
  },
  {
    address: "6jM2nP6qS9tU1vW4xZ7a",
    label: "Sanctum",
    threshold: { current: 3, total: 5 },
    score: 71,
    riskLevel: "low",
    lastActivity: "10 hr ago",
  },
  {
    address: "7kN3oQ7rT0uV2wX5yA8b",
    label: "Meteora",
    threshold: { current: 2, total: 3 },
    score: 44,
    riskLevel: "medium",
    lastActivity: "12 hr ago",
  },
  {
    address: "8lO4pR8sU1vW3xY6zA9c",
    label: "Zeta Markets",
    threshold: { current: 4, total: 5 },
    score: 83,
    riskLevel: "safe",
    lastActivity: "14 hr ago",
  },
  {
    address: "9mP5qS9tV2wX4yZ7aB0d",
    label: "Hubble Protocol",
    threshold: { current: 2, total: 4 },
    score: 18,
    riskLevel: "critical",
    lastActivity: "1 day ago",
  },
  {
    address: "0nQ6rT0uW3xY5zA8bC1e",
    label: "Tulip Protocol",
    threshold: { current: 3, total: 5 },
    score: 59,
    riskLevel: "medium",
    lastActivity: "1 day ago",
  },
  {
    address: "1oR7sU1vX4yZ6aB9cD2f",
    label: "Lido (wstSOL)",
    threshold: { current: 5, total: 7 },
    score: 87,
    riskLevel: "safe",
    lastActivity: "2 days ago",
  },
  {
    address: "2pS8tV2wY5zA7bC0dE3g",
    label: "Switchboard",
    threshold: { current: 3, total: 5 },
    score: 65,
    riskLevel: "low",
    lastActivity: "2 days ago",
  },
];

/* ───────────────────────────────────────────────────────────
 * Landing page  (components/landing/StatsSection.tsx)
 * ─────────────────────────────────────────────────────────── */

export const MOCK_LANDING_PROPOSALS: Array<{
  id: string;
  timeAgo: string;
  multisig: string;
  riskLevel: RiskLevel;
}> = [
  {
    id: "#1247",
    timeAgo: "2 min ago",
    multisig: "Drift Protocol",
    riskLevel: "low",
  },
  {
    id: "#1246",
    timeAgo: "8 min ago",
    multisig: "Marinade Finance",
    riskLevel: "critical",
  },
  {
    id: "#1245",
    timeAgo: "15 min ago",
    multisig: "Jupiter Exchange",
    riskLevel: "medium",
  },
  {
    id: "#1244",
    timeAgo: "23 min ago",
    multisig: "Tensor NFT",
    riskLevel: "safe",
  },
  {
    id: "#1243",
    timeAgo: "31 min ago",
    multisig: "Raydium",
    riskLevel: "high",
  },
  { id: "#1242", timeAgo: "45 min ago", multisig: "Orca", riskLevel: "low" },
];

export const MOCK_LANDING_WALLETS: Array<{
  address: string;
  timeAgo: string;
  label: string;
  riskLevel: RiskLevel;
}> = [
  {
    address: "7xK9..aB3q",
    timeAgo: "1 min ago",
    label: "Squads 3/5",
    riskLevel: "safe",
  },
  {
    address: "3mQ7..zF1w",
    timeAgo: "5 min ago",
    label: "Squads 2/3",
    riskLevel: "medium",
  },
  {
    address: "9pR2..wK8e",
    timeAgo: "12 min ago",
    label: "Squads 4/7",
    riskLevel: "safe",
  },
  {
    address: "5nL4..hG6y",
    timeAgo: "18 min ago",
    label: "Squads 2/5",
    riskLevel: "critical",
  },
  {
    address: "2jM8..cD0r",
    timeAgo: "27 min ago",
    label: "Squads 3/5",
    riskLevel: "low",
  },
  {
    address: "8tV6..pN2x",
    timeAgo: "34 min ago",
    label: "Squads 5/9",
    riskLevel: "safe",
  },
];

/* ───────────────────────────────────────────────────────────
 * Proposal detail page  (proposal/[id]/page.tsx)
 * ─────────────────────────────────────────────────────────── */

export const MOCK_PROPOSAL_DETAILS: Record<
  string,
  {
    id: string;
    multisig: string;
    multisigAddress: string;
    description: string;
    status: "Pending" | "Executed" | "Rejected";
    riskLevel: "critical" | "high" | "medium" | "low" | "safe";
    score: number;
    created: string;
    executed: string | null;
    signers: Array<{
      address: string;
      label: string;
      signed: boolean;
    }>;
    actions: string[];
  }
> = {
  "1247": {
    id: "#1247",
    multisig: "Drift Protocol",
    multisigAddress: "7gYJPNhRsyuiFWTr9apSUqbBHTNVV3bfya4RoHwbD6vp",
    description: "Transfer 500 SOL to external wallet",
    status: "Pending",
    riskLevel: "low",
    score: 73,
    created: "2 min ago",
    executed: null,
    signers: [
      { address: "3mQ7..zF1w", label: "Treasury Lead", signed: true },
      { address: "9pR2..wK8e", label: "Dev Ops", signed: true },
      { address: "5nL4..hG6y", label: "Contributor", signed: false },
      { address: "2jM8..cD0r", label: "Founder", signed: false },
      { address: "8tV6..pN2x", label: "Advisor", signed: false },
    ],
    actions: [
      "SOL Transfer: 500 SOL → 4kR9..mN3x",
      "Fee payer: Squads treasury",
    ],
  },
  "1246": {
    id: "#1246",
    multisig: "Marinade Finance",
    multisigAddress: "3mQ7dL8kR9pN2wBvT5zF1w",
    description: "Update upgrade authority to new key",
    status: "Executed",
    riskLevel: "critical",
    score: 12,
    created: "8 min ago",
    executed: "5 min ago",
    signers: [
      { address: "7xK9..aB3q", label: "Admin", signed: true },
      { address: "3mQ7..zF1w", label: "Operator", signed: true },
      { address: "9pR2..wK8e", label: "Security", signed: true },
    ],
    actions: [
      "SetUpgradeAuthority: program 5nL4..hG6y",
      "New authority: 8tV6..pN2x",
    ],
  },
  "1245": {
    id: "#1245",
    multisig: "Jupiter Exchange",
    multisigAddress: "9pR2vN5cX8hG6yL4wK8e",
    description: "Add new signer to multisig",
    status: "Executed",
    riskLevel: "medium",
    score: 51,
    created: "15 min ago",
    executed: "10 min ago",
    signers: [
      { address: "2jM8..cD0r", label: "Founder", signed: true },
      { address: "8tV6..pN2x", label: "CTO", signed: true },
      { address: "7xK9..aB3q", label: "Ops", signed: false },
    ],
    actions: ["AddMember: 4kR9..mN3x", "New threshold: 3 of 4"],
  },
};
