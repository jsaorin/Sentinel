import type {
	AffectedEntityKind,
	AffectedEntityRole,
} from "../entities/AffectedEntity.js";
import type { MultisigThreatExposure } from "../entities/MultisigThreatExposure.js";

export interface UpsertMultisigThreatExposureInput {
	multisigId: string;
	signerId: string | null;
	signerAddress: string;
	threatSignalId: string;
	threatSignalEntityId: string;
	kind: AffectedEntityKind;
	role: AffectedEntityRole | null;
	detectedAt: Date;
}

export interface IMultisigThreatExposureRepository {
	upsert(
		input: UpsertMultisigThreatExposureInput,
	): Promise<MultisigThreatExposure>;
	findByMultisigId(multisigId: string): Promise<MultisigThreatExposure[]>;
}
