-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('DRAFT', 'ACTIVE', 'APPROVED', 'REJECTED', 'EXECUTED', 'CANCELLED');

-- AlterTable
ALTER TABLE "multisig" ADD COLUMN     "config_authority" TEXT,
ADD COLUMN     "threshold" INTEGER;

-- CreateTable
CREATE TABLE "proposal" (
    "id" TEXT NOT NULL,
    "multisig_id" TEXT NOT NULL,
    "proposal_index" INTEGER NOT NULL,
    "transaction_index" INTEGER NOT NULL,
    "status" "ProposalStatus" NOT NULL,
    "creator" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "executed_at" TIMESTAMP(3),

    CONSTRAINT "proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signer" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "multisig_id" TEXT NOT NULL,
    "permissions" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "signer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "proposal_multisig_id_idx" ON "proposal"("multisig_id");

-- CreateIndex
CREATE INDEX "proposal_status_idx" ON "proposal"("status");

-- CreateIndex
CREATE UNIQUE INDEX "proposal_multisig_id_proposal_index_key" ON "proposal"("multisig_id", "proposal_index");

-- CreateIndex
CREATE INDEX "signer_multisig_id_idx" ON "signer"("multisig_id");

-- CreateIndex
CREATE UNIQUE INDEX "signer_multisig_id_address_key" ON "signer"("multisig_id", "address");

-- AddForeignKey
ALTER TABLE "proposal" ADD CONSTRAINT "proposal_multisig_id_fkey" FOREIGN KEY ("multisig_id") REFERENCES "multisig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signer" ADD CONSTRAINT "signer_multisig_id_fkey" FOREIGN KEY ("multisig_id") REFERENCES "multisig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
