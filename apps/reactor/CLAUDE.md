# Presentation Layer — apps/reactor

RabbitMQ event consumer. Handlers are thin: get handler from container, execute, done. **ZERO business logic.**

## Structure

```
apps/reactor/src/
├── handler/
│   └── [domain]/
│       ├── on[Event].ts        # Event handler
│       └── schema.ts           # Zod validation schema
├── messaging/
│   └── registry.ts             # Subscription definitions
├── container/
│   └── config/
│       ├── configTypes.ts
│       └── configBinding.ts
├── env/
│   ├── reactor-environment.ts
│   └── env-validation.config.ts
├── logger/
│   └── logger.ts
├── inversify.config.ts
├── app.ts
└── index.ts
```

## Event Handler

```typescript
// apps/reactor/src/handler/scoring/onProposalCreated.ts

import type { HandlerContext } from "../../messaging/types.js";
import { APPLICATION_TYPES } from "@sentinel/application";
import type { ScoreProposalCommandHandler } from "@sentinel/application";

export async function onProposalCreated(
  ctx: HandlerContext<{ proposalId: string; multisigAddress: string }>
): Promise<void> {
  const { proposalId, multisigAddress } = ctx.event.data;
  const { container, logger } = ctx;

  const handler = container.get<ScoreProposalCommandHandler>(
    APPLICATION_TYPES.ScoreProposalCommandHandler
  );

  await handler.execute({ proposalId, multisigAddress });
  logger.info("Proposal scored", { proposalId });
}
```

## Event Schema

```typescript
import { z } from "zod";

export const ProposalCreatedSchema = z.object({
  id: z.string(),
  type: z.literal("proposal.created"),
  time: z.string(),
  data: z.object({
    proposalId: z.string(),
    multisigAddress: z.string(),
  }),
});
```

## Critical Rules

1. **Handlers are thin** — get handler from container, execute, log. Nothing else.
2. **Validate with Zod schemas** — parse before processing.
3. **Configure retry appropriately** — exponential backoff with jitter.

## Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Event Handler | `on[Event]` | `onProposalCreated`, `onRiskScoreUpdated` |
| Schema | `[Event]Schema` | `ProposalCreatedSchema` |

## Pre-Implementation Checklist

- [ ] Does the Application handler exist?
- [ ] Created Zod schema for validation?
- [ ] Handler is thin (just gets use case and calls execute)?
- [ ] Added subscription to registry?
