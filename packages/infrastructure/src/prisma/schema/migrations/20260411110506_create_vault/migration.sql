-- CreateTable
CREATE TABLE "vault" (
    "id" TEXT NOT NULL,
    "multisig_id" TEXT NOT NULL,
    "vault_index" INTEGER NOT NULL,
    "pda" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vault_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vault_multisig_id_idx" ON "vault"("multisig_id");

-- CreateIndex
CREATE UNIQUE INDEX "vault_multisig_id_vault_index_key" ON "vault"("multisig_id", "vault_index");

-- AddForeignKey
ALTER TABLE "vault" ADD CONSTRAINT "vault_multisig_id_fkey" FOREIGN KEY ("multisig_id") REFERENCES "multisig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
