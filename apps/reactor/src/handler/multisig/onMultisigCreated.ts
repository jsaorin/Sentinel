import {
	APPLICATION_TYPES,
	type AnalyzeMultisigCommandHandler,
} from "@sentinel/application";
import type { Handler } from "../../messaging/types.js";
import type { MultisigCreatedEvent } from "./schema.js";

export const onMultisigCreated: Handler<MultisigCreatedEvent["data"]> = async (
	ctx,
) => {
	const { event, logger, container } = ctx;
	const { multisigId, address } = event.data;

	logger.info("multisig:created:received", { multisigId, address });

	const handler = container.get<AnalyzeMultisigCommandHandler>(
		APPLICATION_TYPES.AnalyzeMultisigCommandHandler,
	);

	const result = await handler.execute({ multisigId, address });

	logger.info("multisig:created:processed", {
		multisigId,
		threshold: result.threshold,
		signersCount: result.signersCount,
		proposalsCount: result.proposalsCount,
	});
};
