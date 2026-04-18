import type {
	IScoringService,
	MultisigScoreData,
	MultisigScoringContext,
	ProposalScoreData,
	ProposalScoringContext,
} from "@sentinel/domain";
import { injectable } from "inversify";
import { scoreMultisigHealth } from "./MultisigHealthScorer.js";
import { scoreProposalRisk } from "./ProposalRiskScorer.js";

@injectable()
export class ScoringService implements IScoringService {
	scoreMultisig(context: MultisigScoringContext): MultisigScoreData {
		return scoreMultisigHealth(context);
	}

	scoreProposal(context: ProposalScoringContext): ProposalScoreData {
		return scoreProposalRisk(context);
	}
}
