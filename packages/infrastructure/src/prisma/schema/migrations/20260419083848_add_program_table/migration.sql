-- CreateTable
CREATE TABLE "program" (
    "id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "name" TEXT,
    "idl_json" JSONB,
    "idl_version" TEXT,
    "idl_source" TEXT NOT NULL,
    "idl_checksum" TEXT,
    "idl_fetched_at" TIMESTAMP(3),
    "first_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "program_program_id_key" ON "program"("program_id");

-- CreateIndex
CREATE INDEX "program_program_id_idx" ON "program"("program_id");
