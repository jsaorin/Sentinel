import {
	APPLICATION_TYPES,
	type SyncMultisigStateCommandHandler,
} from "@sentinel/application";
import { DOMAIN_TYPES, type IHeliusPayloadClassifier } from "@sentinel/domain";
import type { Handler } from "../../messaging/types.js";
import type { HeliusWebhookEvent } from "./schema.js";

export const onHeliusWebhookReceived: Handler<
	HeliusWebhookEvent["data"]
> = async (ctx) => {
	const { event, logger, container } = ctx;

	const classifier = container.get<IHeliusPayloadClassifier>(
		DOMAIN_TYPES.HeliusPayloadClassifier,
	);
	const classified = classifier.classify(event.data);

	if (!classified) {
		logger.debug("helius:webhook:no-squads-instruction", {
			eventId: event.id,
		});
		return;
	}

	logger.info("helius:webhook:classified", {
		eventId: event.id,
		multisigAddress: classified.multisigAddress,
		kind: classified.kind,
		proposalPda: classified.proposalPda,
	});

	const handler = container.get<SyncMultisigStateCommandHandler>(
		APPLICATION_TYPES.SyncMultisigStateCommandHandler,
	);

	const result = await handler.execute({
		multisigAddress: classified.multisigAddress,
		kind: classified.kind,
		proposalPda: classified.proposalPda,
	});

	logger.info("helius:webhook:processed", {
		eventId: event.id,
		multisigAddress: classified.multisigAddress,
		skipped: result.skipped,
		configChanged: result.configChanged,
		proposalsCreated: result.proposalsCreated,
		proposalsUpdated: result.proposalsUpdated,
	});
};
