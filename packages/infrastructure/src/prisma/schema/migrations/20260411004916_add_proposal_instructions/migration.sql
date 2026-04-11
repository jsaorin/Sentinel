-- CreateTable
CREATE TABLE "proposal_instruction" (
    "id" TEXT NOT NULL,
    "proposal_id" TEXT NOT NULL,
    "instruction_index" INTEGER NOT NULL,
    "program_id" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "accounts" TEXT[],

    CONSTRAINT "proposal_instruction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "proposal_instruction_proposal_id_idx" ON "proposal_instruction"("proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "proposal_instruction_proposal_id_instruction_index_key" ON "proposal_instruction"("proposal_id", "instruction_index");

-- AddForeignKey
ALTER TABLE "proposal_instruction" ADD CONSTRAINT "proposal_instruction_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
