import {
	APPLICATION_TYPES,
	type SummarizeMultisigAICommandHandler,
} from "@sentinel/application";
import type { Handler } from "../../messaging/types.js";
import type { MultisigScoredEvent } from "./schema.js";

export const onMultisigScored: Handler<MultisigScoredEvent["data"]> = async (
	ctx,
) => {
	const { event, logger, container } = ctx;
	const { multisigId, overallScore } = event.data;

	logger.info("multisig:scored:received", { multisigId, overallScore });

	const handler = container.get<SummarizeMultisigAICommandHandler>(
		APPLICATION_TYPES.SummarizeMultisigAICommandHandler,
	);

	const result = await handler.execute({ multisigId });

	logger.info("multisig:scored:processed", {
		multisigId,
		aiSummaryGenerated: Boolean(result.aiSummary),
	});
};
