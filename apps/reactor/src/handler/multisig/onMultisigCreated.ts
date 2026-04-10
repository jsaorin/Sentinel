import type { Handler } from "../../messaging/types.js";
import type { MultisigCreatedEvent } from "./schema.js";

export const onMultisigCreated: Handler<
	MultisigCreatedEvent["data"]
> = async (ctx) => {
	const { event, logger } = ctx;
	const { multisigId, address } = event.data;

	logger.info("multisig:created:received", { multisigId, address });

	// TODO: Replace with AnalyzeMultisigCommandHandler once implemented
	// const handler = container.get<AnalyzeMultisigCommandHandler>(
	//   APPLICATION_TYPES.AnalyzeMultisigCommandHandler
	// );
	// await handler.execute({ multisigId, address });

	logger.info("multisig:created:processed", { multisigId, address });
};
