import {
	APPLICATION_TYPES,
	type ScanMultisigNoncesCommandHandler,
} from "@sentinel/application";
import type { Handler } from "../../messaging/types.js";
import type { MultisigNonceScanRequestedEvent } from "./schema.js";

export const onMultisigNonceScanRequested: Handler<
	MultisigNonceScanRequestedEvent["data"]
> = async (ctx) => {
	const { event, logger, container } = ctx;
	const { multisigAddress } = event.data;

	logger.info("nonce:scan:event-received", { multisigAddress });

	const handler = container.get<ScanMultisigNoncesCommandHandler>(
		APPLICATION_TYPES.ScanMultisigNoncesCommandHandler,
	);
	const result = await handler.execute({ multisigAddress });

	logger.info("nonce:scan:event-processed", {
		multisigAddress,
		signerCount: result.signerCount,
		newNoncesFound: result.newNoncesFound,
		durationMs: result.durationMs,
	});
};
