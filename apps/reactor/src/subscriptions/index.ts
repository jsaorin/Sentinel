import type { Subscription } from "../messaging/types.js";
import { heliusWebhookProcessSubscription } from "./helius-webhook-process.subscription.js";
import { multisigAiSummarySubscription } from "./multisig-ai-summary.subscription.js";
import { multisigAnalyzeSubscription } from "./multisig-analyze.subscription.js";
import { multisigNonceScanSubscription } from "./multisig-nonce-scan.subscription.js";
import { proposalAiAnalysisSubscription } from "./proposal-ai-analysis.subscription.js";
import { threatSignalAnalysisSubscription } from "./threat-signal-analysis.subscription.js";

export const subscriptions: Subscription[] = [
	multisigAnalyzeSubscription,
	multisigAiSummarySubscription,
	proposalAiAnalysisSubscription,
	threatSignalAnalysisSubscription,
	heliusWebhookProcessSubscription,
	multisigNonceScanSubscription,
];
