import type { Subscription } from "../messaging/types.js";
import { multisigAnalyzeSubscription } from "./multisig-analyze.subscription.js";

export const subscriptions: Subscription[] = [multisigAnalyzeSubscription];
