-- CreateTable
CREATE TABLE "multisig_score" (
    "id" TEXT NOT NULL,
    "multisig_id" TEXT NOT NULL,
    "overall_score" INTEGER NOT NULL,
    "threshold_score" INTEGER NOT NULL,
    "config_authority_score" INTEGER NOT NULL,
    "signer_concentration_score" INTEGER NOT NULL,
    "signer_count_score" INTEGER NOT NULL,
    "warnings" JSONB NOT NULL DEFAULT '[]',
    "ai_summary" TEXT,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "multisig_score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_score" (
    "id" TEXT NOT NULL,
    "proposal_id" TEXT NOT NULL,
    "risk_score" INTEGER NOT NULL,
    "flags" JSONB NOT NULL DEFAULT '[]',
    "summary" TEXT NOT NULL,
    "ai_analysis" TEXT,
    "recommendation" TEXT,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposal_score_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "multisig_score_multisig_id_key" ON "multisig_score"("multisig_id");

-- CreateIndex
CREATE INDEX "multisig_score_multisig_id_idx" ON "multisig_score"("multisig_id");

-- CreateIndex
CREATE UNIQUE INDEX "proposal_score_proposal_id_key" ON "proposal_score"("proposal_id");

-- CreateIndex
CREATE INDEX "proposal_score_proposal_id_idx" ON "proposal_score"("proposal_id");

-- AddForeignKey
ALTER TABLE "multisig_score" ADD CONSTRAINT "multisig_score_multisig_id_fkey" FOREIGN KEY ("multisig_id") REFERENCES "multisig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_score" ADD CONSTRAINT "proposal_score_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
