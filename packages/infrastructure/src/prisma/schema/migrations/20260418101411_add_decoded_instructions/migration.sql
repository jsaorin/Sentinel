-- CreateTable
CREATE TABLE "decoded_instruction" (
    "id" TEXT NOT NULL,
    "proposal_instruction_id" TEXT NOT NULL,
    "program_name" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "params" JSONB NOT NULL DEFAULT '{}',
    "accounts" JSONB NOT NULL DEFAULT '[]',
    "summary" TEXT NOT NULL,
    "is_known" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "decoded_instruction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "decoded_instruction_proposal_instruction_id_key" ON "decoded_instruction"("proposal_instruction_id");

-- CreateIndex
CREATE INDEX "decoded_instruction_proposal_instruction_id_idx" ON "decoded_instruction"("proposal_instruction_id");

-- CreateIndex
CREATE INDEX "decoded_instruction_is_known_idx" ON "decoded_instruction"("is_known");

-- AddForeignKey
ALTER TABLE "decoded_instruction" ADD CONSTRAINT "decoded_instruction_proposal_instruction_id_fkey" FOREIGN KEY ("proposal_instruction_id") REFERENCES "proposal_instruction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
