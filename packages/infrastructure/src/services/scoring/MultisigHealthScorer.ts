import { decodePermissionsMask } from "@sentinel/common/utils";
import type {
	MultisigScoreData,
	MultisigScoreWarning,
	MultisigScoringContext,
} from "@sentinel/domain";

const WEIGHT_THRESHOLD = 0.4;
const WEIGHT_CONFIG_AUTHORITY = 0.25;
const WEIGHT_SIGNER_CONCENTRATION = 0.2;
const WEIGHT_SIGNER_COUNT = 0.15;

const CAP_SINGLE_SIGNER = 15;
const CAP_THRESHOLD_ONE = 20;
const CAP_EXTERNAL_NONCE_FUNDER = 25;
const CAP_NONCE_ACCOUNT_PRESENT = 60;
const CAP_SIGNER_LINKED_TO_ATTACK = 10;
const CAP_SIGNER_LINKED_TO_VULNERABILITY = 35;

export function scoreMultisigHealth(
	context: MultisigScoringContext,
): MultisigScoreData {
	const signerCount = context.signers.length;
	const threshold = context.threshold ?? 0;

	const thresholdScore = scoreThreshold(threshold, signerCount);
	const configAuthorityScore = scoreConfigAuthority(context.configAuthority);
	const signerConcentrationScore = scoreSignerConcentration(context.signers);
	const signerCountScore = scoreSignerCount(signerCount);

	const weightedAverage = Math.round(
		thresholdScore * WEIGHT_THRESHOLD +
			configAuthorityScore * WEIGHT_CONFIG_AUTHORITY +
			signerConcentrationScore * WEIGHT_SIGNER_CONCENTRATION +
			signerCountScore * WEIGHT_SIGNER_COUNT,
	);

	const overallScore = applySecurityCaps(weightedAverage, context);
	const warnings = buildWarnings(context);

	return {
		overallScore,
		thresholdScore,
		configAuthorityScore,
		signerConcentrationScore,
		signerCountScore,
		warnings,
	};
}

function applySecurityCaps(
	weightedAverage: number,
	context: MultisigScoringContext,
): number {
	const signerCount = context.signers.length;
	const threshold = context.threshold ?? 0;
	const nonceAccounts = context.nonceAccounts ?? [];
	const threatExposures = context.threatExposures ?? [];

	let cap = 100;

	if (signerCount === 1) {
		cap = Math.min(cap, CAP_SINGLE_SIGNER);
	}

	if (threshold === 1 && signerCount > 1) {
		cap = Math.min(cap, CAP_THRESHOLD_ONE);
	}

	if (nonceAccounts.some((n) => n.externallyFunded)) {
		cap = Math.min(cap, CAP_EXTERNAL_NONCE_FUNDER);
	} else if (nonceAccounts.length > 0) {
		cap = Math.min(cap, CAP_NONCE_ACCOUNT_PRESENT);
	}

	if (threatExposures.some((e) => e.severity === "critical")) {
		cap = Math.min(cap, CAP_SIGNER_LINKED_TO_ATTACK);
	} else if (threatExposures.some((e) => e.severity === "high")) {
		cap = Math.min(cap, CAP_SIGNER_LINKED_TO_VULNERABILITY);
	}

	return Math.min(weightedAverage, cap);
}

function scoreThreshold(threshold: number, signerCount: number): number {
	if (signerCount === 0 || threshold === 0) return 0;
	if (threshold === 1) return 0;

	const ratio = threshold / signerCount;
	if (ratio >= 1.0) return 100;
	if (ratio >= 0.66) return 80;
	if (ratio >= 0.5) return 60;
	if (ratio >= 0.4) return 40;
	if (ratio >= 0.33) return 30;
	return 20;
}

function scoreConfigAuthority(configAuthority: string | null): number {
	return configAuthority === null ? 100 : 20;
}

function scoreSignerConcentration(
	signers: MultisigScoringContext["signers"],
): number {
	if (signers.length === 0) return 0;

	const concentrated = signers.filter((signer) => {
		const { initiate, vote, execute } = decodePermissionsMask(
			signer.permissions.mask,
		);
		return initiate && vote && execute;
	}).length;

	const ratio = concentrated / signers.length;
	return Math.round(100 - ratio * 90);
}

function scoreSignerCount(count: number): number {
	if (count >= 5) return 100;
	if (count === 4) return 80;
	if (count === 3) return 60;
	if (count === 2) return 30;
	return 0;
}

function buildWarnings(
	context: MultisigScoringContext,
): MultisigScoreWarning[] {
	const previousByKey = new Map<string, Date>();
	for (const w of context.previousWarnings ?? []) {
		previousByKey.set(warningKey(w.code, w.subject), w.detectedAt);
	}

	const now = new Date();
	const make = (
		code: string,
		subject: string | null,
		message: string,
	): MultisigScoreWarning => ({
		code,
		message,
		subject,
		detectedAt: previousByKey.get(warningKey(code, subject)) ?? now,
	});

	const warnings: MultisigScoreWarning[] = [];
	const signerCount = context.signers.length;
	const threshold = context.threshold ?? 0;

	if (threshold === 1 && signerCount > 1) {
		warnings.push(
			make(
				"CRITICAL_THRESHOLD_ONE",
				null,
				"Threshold = 1: any signer can execute transactions alone. This multisig provides no additional protection over a single-signer wallet",
			),
		);
	} else if (
		signerCount > 0 &&
		threshold > 0 &&
		threshold / signerCount <= 0.5
	) {
		const recommended = Math.ceil(signerCount * 0.6);
		warnings.push(
			make(
				"LOW_THRESHOLD",
				null,
				`Low threshold: ${threshold}/${signerCount}. Recommended at least ${recommended}/${signerCount}`,
			),
		);
	}

	if (context.configAuthority !== null) {
		warnings.push(
			make(
				"EXTERNAL_CONFIG_AUTHORITY",
				null,
				"External config authority assigned. This address can modify the multisig without signer approval",
			),
		);
	}

	for (const signer of context.signers) {
		const { initiate, vote, execute } = decodePermissionsMask(
			signer.permissions.mask,
		);
		if (initiate && vote && execute) {
			warnings.push(
				make(
					"CONCENTRATED_SIGNER",
					signer.address,
					`Signer ${signer.address} holds all permissions (initiate+vote+execute). Consider separating roles`,
				),
			);
		}
	}

	if (signerCount < 3 && signerCount > 0) {
		warnings.push(
			make(
				"LOW_SIGNER_COUNT",
				null,
				`Only ${signerCount} signer(s). Minimum of 3 recommended`,
			),
		);
	}

	const nonceAccounts = context.nonceAccounts ?? [];
	const externallyFundedNonces = nonceAccounts.filter(
		(n) => n.externallyFunded,
	);
	if (externallyFundedNonces.length > 0) {
		for (const n of externallyFundedNonces) {
			warnings.push(
				make(
					"EXTERNAL_NONCE_FUNDER",
					n.address,
					`Durable Nonce account ${n.address} authorized to signer ${n.authority} was funded by external wallet ${n.fundedBy ?? "unknown"}. External funding of a signer-controlled nonce is a known pre-staging pattern for offline-signed transactions — investigate immediately`,
				),
			);
		}
	} else if (nonceAccounts.length > 0) {
		const distinctAuthorities = new Set(nonceAccounts.map((n) => n.authority));
		warnings.push(
			make(
				"NONCE_ACCOUNT_PRESENT_FOR_SIGNER",
				null,
				`${nonceAccounts.length} Durable Nonce account(s) authorized to ${distinctAuthorities.size} signer(s). Verify each is a known offline-signing tool`,
			),
		);
	}

	const threatExposures = context.threatExposures ?? [];
	for (const exposure of threatExposures) {
		const roleLabel = exposure.role ?? "unknown";
		if (exposure.severity === "critical") {
			warnings.push(
				make(
					"SIGNER_LINKED_TO_ATTACK",
					exposure.signerAddress,
					`Signer ${exposure.signerAddress} was identified in a threat report as ${roleLabel}. Treat this multisig as compromised and rotate the key immediately`,
				),
			);
		} else if (exposure.severity === "high") {
			warnings.push(
				make(
					"SIGNER_LINKED_TO_VULNERABILITY",
					exposure.signerAddress,
					`Signer ${exposure.signerAddress} is flagged as ${roleLabel} in a recent threat report. Investigate and consider rotating the key`,
				),
			);
		} else {
			warnings.push(
				make(
					"SIGNER_FLAGGED_IN_THREAT",
					exposure.signerAddress,
					`Signer ${exposure.signerAddress} appears in a threat report (role: ${roleLabel}). Review the source for context`,
				),
			);
		}
	}

	return warnings;
}

function warningKey(code: string, subject: string | null): string {
	return `${code}|${subject ?? ""}`;
}
