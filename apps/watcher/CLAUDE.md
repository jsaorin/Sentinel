# Presentation Layer — apps/watcher

External feed ingestion worker. Listens to threat-intel sources (currently Telegram channels) and emits `threat.signal.received` integration events to RabbitMQ. **ZERO business logic.**

## Structure

```
apps/watcher/src/
├── env/
│   ├── watcher-environment.ts      # Env validation (envalid + zod)
│   └── env-validation.config.ts
├── container/
│   └── config/configBinding.ts     # Binds env config into Inversify
├── logger/logger.ts
├── inversify.config.ts             # Loads DI modules from infra/application
├── app.ts                          # Bootstraps TelegramWatcherService
└── index.ts                        # Entry point + signal handlers
```

## What it does

1. `TelegramWatcherService` (infrastructure) connects to Telegram via grammy polling.
2. For each `channel_post` on a configured channel, it builds a `ThreatSource` and calls `IngestThreatSignalCommandHandler` (application).
3. The handler publishes a `threat.signal.received` integration event through `IOutboxEventPublisher`.
4. The reactor consumes the event (see `apps/reactor/src/subscriptions/threat-signal-analysis.subscription.ts`) and runs AI analysis + persistence.

The watcher app itself does NOT analyze, persist, or score. It only ingests and publishes.

## Required env vars

```
TELEGRAM_BOT_TOKEN=<from @BotFather>
TELEGRAM_CHANNELS=[{"id":"-1001234567890","label":"Solana Security Alerts"}]
RABBITMQ_PROTOCOL=amqp
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
```

`TELEGRAM_CHANNELS` is a JSON array. The bot must be added as an **admin** of every channel listed (Telegram otherwise hides channel posts from bots).

## Adding a new source (twitter, rss, ...)

Extend `ThreatSourceKind` in `packages/domain/src/events/ThreatSignalReceived.ts` and create a new service under `packages/infrastructure/src/services/watchers/`. Follow the same shape as `TelegramWatcherService`:

- Inject the source-specific config from `DOMAIN_CONFIG_TYPES`.
- Inject `IngestThreatSignalCommandHandler` from `APPLICATION_TYPES`.
- On every new item, call `ingestHandler.execute({ source, externalId, content, capturedAt })`.

Then add a binding in `ServiceModule.ts` and wire it into `apps/watcher/src/app.ts` (or split into a new app if the operational concerns diverge).

## Critical Rules

1. **Thin worker** — parse input, call ingest handler. No scoring, no analysis, no DB writes.
2. **No HTTP surface** — this is a worker, not behind Caddy, not healthchecked via HTTP.
3. **Validate env at boot** — `WatcherEnvironment` must throw before any network call if `TELEGRAM_CHANNELS` is malformed.
4. **Graceful shutdown** — `SIGTERM`/`SIGINT` must stop polling and close the RabbitMQ connection.

## Pre-Implementation Checklist (new source)

- [ ] Extended `ThreatSourceKind` in domain?
- [ ] Created service under `packages/infrastructure/src/services/watchers/`?
- [ ] Registered binding in `ServiceModule.ts`?
- [ ] Added source-specific env vars to `watcher-environment.ts`?
- [ ] Updated `.env.example`?
- [ ] Bot/account has the required read permissions on the source?
