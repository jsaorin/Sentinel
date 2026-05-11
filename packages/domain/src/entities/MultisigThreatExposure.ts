import type {
	AffectedEntityKind,
	AffectedEntityRole,
} from "./AffectedEntity.js";

export type ThreatExposureSeverity = "critical" | "high" | "medium";

export class MultisigThreatExposure {
	public readonly id: string;
	public readonly multisigId: string;
	public readonly signerId: string | null;
	public readonly signerAddress: string;
	public readonly threatSignalId: string;
	public readonly threatSignalEntityId: string;
	public readonly kind: AffectedEntityKind;
	public readonly role: AffectedEntityRole | null;
	public readonly detectedAt: Date;
	public readonly createdAt: Date;
	public readonly updatedAt: Date;

	constructor(params: {
		id: string;
		multisigId: string;
		signerId: string | null;
		signerAddress: string;
		threatSignalId: string;
		threatSignalEntityId: string;
		kind: AffectedEntityKind;
		role: AffectedEntityRole | null;
		detectedAt: Date;
		createdAt: Date;
		updatedAt: Date;
	}) {
		this.id = params.id;
		this.multisigId = params.multisigId;
		this.signerId = params.signerId;
		this.signerAddress = params.signerAddress;
		this.threatSignalId = params.threatSignalId;
		this.threatSignalEntityId = params.threatSignalEntityId;
		this.kind = params.kind;
		this.role = params.role;
		this.detectedAt = params.detectedAt;
		this.createdAt = params.createdAt;
		this.updatedAt = params.updatedAt;
	}

	get severity(): ThreatExposureSeverity {
		return severityForRole(this.role);
	}
}

export function severityForRole(
	role: AffectedEntityRole | null,
): ThreatExposureSeverity {
	if (role === "attacker" || role === "compromised") return "critical";
	if (role === "vulnerable") return "high";
	return "medium";
}
