-- CreateEnum
CREATE TYPE "ThreatSourceKind" AS ENUM ('telegram', 'twitter', 'rss');

-- CreateEnum
CREATE TYPE "ThreatSeverity" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "ThreatCategory" AS ENUM ('phishing', 'rugpull', 'exploit', 'compromised_key', 'other');

-- CreateEnum
CREATE TYPE "AffectedEntityKind" AS ENUM ('program', 'multisig', 'wallet');

-- CreateTable
CREATE TABLE "threat_signals" (
    "id" TEXT NOT NULL,
    "source_kind" "ThreatSourceKind" NOT NULL,
    "source_identifier" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "source_label" TEXT,
    "content" TEXT NOT NULL,
    "captured_at" TIMESTAMP(3) NOT NULL,
    "is_threat" BOOLEAN,
    "severity" "ThreatSeverity",
    "category" "ThreatCategory",
    "summary" TEXT,
    "raw_analysis_json" JSONB,
    "analyzed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "threat_signals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "threat_signal_entities" (
    "id" TEXT NOT NULL,
    "threat_signal_id" TEXT NOT NULL,
    "kind" "AffectedEntityKind" NOT NULL,
    "address" TEXT NOT NULL,
    "context_snippet" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "threat_signal_entities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "threat_signals_is_threat_idx" ON "threat_signals"("is_threat");

-- CreateIndex
CREATE UNIQUE INDEX "threat_signals_source_kind_source_identifier_external_id_key" ON "threat_signals"("source_kind", "source_identifier", "external_id");

-- CreateIndex
CREATE INDEX "threat_signal_entities_address_idx" ON "threat_signal_entities"("address");

-- CreateIndex
CREATE INDEX "threat_signal_entities_kind_address_idx" ON "threat_signal_entities"("kind", "address");

-- CreateIndex
CREATE UNIQUE INDEX "threat_signal_entities_threat_signal_id_kind_address_key" ON "threat_signal_entities"("threat_signal_id", "kind", "address");

-- AddForeignKey
ALTER TABLE "threat_signal_entities" ADD CONSTRAINT "threat_signal_entities_threat_signal_id_fkey" FOREIGN KEY ("threat_signal_id") REFERENCES "threat_signals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
