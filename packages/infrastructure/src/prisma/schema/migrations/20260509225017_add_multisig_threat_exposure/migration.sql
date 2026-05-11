-- CreateTable
CREATE TABLE "multisig_threat_exposure" (
    "id" TEXT NOT NULL,
    "multisig_id" TEXT NOT NULL,
    "signer_id" TEXT,
    "signer_address" TEXT NOT NULL,
    "threat_signal_id" TEXT NOT NULL,
    "threat_signal_entity_id" TEXT NOT NULL,
    "kind" "AffectedEntityKind" NOT NULL,
    "role" "AffectedEntityRole",
    "detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "multisig_threat_exposure_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "multisig_threat_exposure_multisig_id_idx" ON "multisig_threat_exposure"("multisig_id");

-- CreateIndex
CREATE INDEX "multisig_threat_exposure_signer_address_idx" ON "multisig_threat_exposure"("signer_address");

-- CreateIndex
CREATE UNIQUE INDEX "multisig_threat_exposure_multisig_id_threat_signal_entity_i_key" ON "multisig_threat_exposure"("multisig_id", "threat_signal_entity_id");

-- AddForeignKey
ALTER TABLE "multisig_threat_exposure" ADD CONSTRAINT "multisig_threat_exposure_multisig_id_fkey" FOREIGN KEY ("multisig_id") REFERENCES "multisig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multisig_threat_exposure" ADD CONSTRAINT "multisig_threat_exposure_signer_id_fkey" FOREIGN KEY ("signer_id") REFERENCES "signer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multisig_threat_exposure" ADD CONSTRAINT "multisig_threat_exposure_threat_signal_id_fkey" FOREIGN KEY ("threat_signal_id") REFERENCES "threat_signals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multisig_threat_exposure" ADD CONSTRAINT "multisig_threat_exposure_threat_signal_entity_id_fkey" FOREIGN KEY ("threat_signal_entity_id") REFERENCES "threat_signal_entities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
