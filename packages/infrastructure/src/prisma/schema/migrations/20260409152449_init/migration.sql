-- CreateEnum
CREATE TYPE "WebhookType" AS ENUM ('MULTISIG_ACTIVITY', 'ADDRESS_ACTIVITY');

-- CreateEnum
CREATE TYPE "OutboxEventStatus" AS ENUM ('PENDING', 'PUBLISHED', 'FAILED');

-- CreateTable
CREATE TABLE "webhook_config" (
    "id" TEXT NOT NULL,
    "helius_webhook_id" TEXT NOT NULL,
    "type" "WebhookType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbox_event" (
    "id" TEXT NOT NULL,
    "exchange" TEXT NOT NULL DEFAULT 'reactor.events',
    "routing_key" TEXT NOT NULL,
    "event" JSONB NOT NULL,
    "status" "OutboxEventStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outbox_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "webhook_config_type_idx" ON "webhook_config"("type");

-- CreateIndex
CREATE INDEX "outbox_event_status_created_at_idx" ON "outbox_event"("status", "created_at");
