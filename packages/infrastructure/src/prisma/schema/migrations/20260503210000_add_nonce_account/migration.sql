-- CreateTable
CREATE TABLE "nonce_account" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "authority" TEXT NOT NULL,
    "funded_by" TEXT,
    "multisig_id" TEXT NOT NULL,
    "signer_id" TEXT NOT NULL,
    "externally_funded" BOOLEAN NOT NULL,
    "detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nonce_account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nonce_account_address_key" ON "nonce_account"("address");

-- CreateIndex
CREATE INDEX "nonce_account_authority_idx" ON "nonce_account"("authority");

-- CreateIndex
CREATE INDEX "nonce_account_multisig_id_idx" ON "nonce_account"("multisig_id");

-- CreateIndex
CREATE INDEX "nonce_account_signer_id_idx" ON "nonce_account"("signer_id");

-- AddForeignKey
ALTER TABLE "nonce_account" ADD CONSTRAINT "nonce_account_multisig_id_fkey" FOREIGN KEY ("multisig_id") REFERENCES "multisig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nonce_account" ADD CONSTRAINT "nonce_account_signer_id_fkey" FOREIGN KEY ("signer_id") REFERENCES "signer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
