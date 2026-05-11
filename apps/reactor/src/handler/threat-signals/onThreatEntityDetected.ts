import {
	APPLICATION_TYPES,
	type LinkThreatEntityToMultisigsCommandHandler,
	type ScoreMultisigHealthCommandHandler,
} from "@sentinel/application";
import type { Handler } from "../../messaging/types.js";
import type { ThreatEntityDetectedEvent } from "./threatEntityDetected.schema.js";

export const onThreatEntityDetected: Handler<
	ThreatEntityDetectedEvent["data"]
> = async (ctx) => {
	const { event, logger, container } = ctx;
	const { threatSignalId, threatSignalEntityId } = event.data;

	logger.info("threat-entity:received", {
		threatSignalId,
		threatSignalEntityId,
	});

	const linkHandler = container.get<LinkThreatEntityToMultisigsCommandHandler>(
		APPLICATION_TYPES.LinkThreatEntityToMultisigsCommandHandler,
	);

	const result = await linkHandler.execute({
		threatSignalId,
		threatSignalEntityId,
	});

	if (result.skipped) {
		logger.info("threat-entity:skipped", {
			threatSignalId,
			threatSignalEntityId,
			reason: result.skippedReason,
		});
		return;
	}

	if (result.affectedMultisigIds.length === 0) {
		logger.info("threat-entity:no-affected-multisigs", {
			threatSignalId,
			threatSignalEntityId,
		});
		return;
	}

	const scoreHandler = container.get<ScoreMultisigHealthCommandHandler>(
		APPLICATION_TYPES.ScoreMultisigHealthCommandHandler,
	);

	for (const multisigId of result.affectedMultisigIds) {
		try {
			await scoreHandler.execute({ multisigId });
			logger.info("threat-entity:rescored-multisig", {
				multisigId,
				threatSignalId,
				threatSignalEntityId,
			});
		} catch (error) {
			logger.error("threat-entity:rescore-failed", {
				multisigId,
				threatSignalId,
				threatSignalEntityId,
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}
};
