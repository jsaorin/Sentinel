# Application Layer — packages/application

This is the MOST CRITICAL layer. ALL business logic orchestration lives here. Follows CQRS: Commands for writes, Queries for reads.

## Structure

```
packages/application/src/
├── usecases/
│   ├── base/
│   │   └── BaseUseCase.ts              # Base class for all handlers
│   ├── health/                         # Health check module
│   └── [module]/                       # Domain modules
│       ├── index.ts
│       ├── types.ts
│       ├── commands/
│       │   └── [Action][Entity]CommandHandler.ts
│       ├── queries/
│       │   └── [Get|List][Entity]QueryHandler.ts
│       └── dtos/
│           └── [HandlerName]Dto.ts
├── ports/                              # Interfaces for external services
│   ├── IEventPublisher.ts
│   └── types.ts
├── container/
│   └── ApplicationModule.ts            # Inversify module bindings
├── types.ts                            # Centralized injection symbols
└── index.ts                            # Re-exports all modules
```

## CQRS Pattern

- **Commands** (writes): `CreateProposalCommandHandler`, `UpdateRiskScoreCommandHandler`
- **Queries** (reads): `GetMultisigQueryHandler`, `ListProposalsQueryHandler`

## Creating a Handler — Full Flow

### 1. Create DTOs (single file, input + output)

```typescript
// packages/application/src/usecases/scoring/dtos/ScoreProposalCommandDto.ts

export type ScoreProposalCommandInputDto = {
  proposalId: string;
  multisigAddress: string;
};

export type ScoreProposalCommandOutputDto = {
  proposalId: string;
  riskScore: number;
  flags: string[];
};
```

### 2. Implement Handler

```typescript
// packages/application/src/usecases/scoring/commands/ScoreProposalCommandHandler.ts

import { injectable, inject, injectFromBase } from "inversify";
import { BaseUseCase } from "../../base/BaseUseCase.js";
import { DOMAIN_TYPES } from "@sentinel/domain";
import type { IProposalRepository } from "@sentinel/domain";
import type {
  ScoreProposalCommandInputDto,
  ScoreProposalCommandOutputDto,
} from "../dtos/ScoreProposalCommandDto.js";

@injectable()
@injectFromBase()  // CRITICAL: without this, logger is undefined!
export class ScoreProposalCommandHandler extends BaseUseCase<
  ScoreProposalCommandInputDto,
  ScoreProposalCommandOutputDto
> {
  constructor(
    @inject(DOMAIN_TYPES.ProposalRepository)
    private proposalRepository: IProposalRepository
  ) {
    super();  // REQUIRED!
  }

  async execute(
    input: ScoreProposalCommandInputDto
  ): Promise<ScoreProposalCommandOutputDto> {
    this.logger.info("Scoring proposal", { proposalId: input.proposalId });
    // ... business logic
  }
}
```

### 3. Add Module Types

```typescript
// packages/application/src/usecases/scoring/types.ts
export const SCORING_USE_CASE_TYPES = {
  ScoreProposalCommandHandler: Symbol.for("ScoreProposalCommandHandler"),
} as const;
```

### 4-6. Wire exports, central types, and container

Update these 5 files in order:
```
1. packages/application/src/usecases/[module]/types.ts          ← Add Symbol
2. packages/application/src/usecases/[module]/index.ts          ← Export handler + DTOs
3. packages/application/src/usecases/types.ts                   ← Spread module types into USECASES_TYPES
4. packages/application/src/container/ApplicationModule.ts      ← bind(Symbol).to(Handler)
5. packages/application/src/index.ts                            ← Re-export from module
```

If ANY step is missed, you get an Inversify "No matching bindings" runtime error.

## Why `@injectFromBase()` Is Required

`BaseUseCase` has a property-injected logger:

```typescript
@injectable()
export abstract class BaseUseCase<TInput, TOutput> {
  @inject(APPLICATION_TYPES.Logger)
  protected logger!: ILogger;

  abstract execute(input: TInput): Promise<TOutput>;
}
```

Without `@injectFromBase()` on the child class, Inversify **cannot see** the parent's `@inject` decorators. Result: `this.logger` is `undefined` at runtime.

```typescript
// ❌ WRONG — logger will be undefined
@injectable()
export class MyHandler extends BaseUseCase<In, Out> { ... }

// ✅ CORRECT — parent's @inject decorators are inherited
@injectable()
@injectFromBase()
export class MyHandler extends BaseUseCase<In, Out> { ... }
```

## Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Command Handler | `[Action][Entity]CommandHandler` | `ScoreProposalCommandHandler` |
| Query Handler | `[Get\|List][Entity]QueryHandler` | `GetMultisigQueryHandler` |
| Input DTO | `[Handler]InputDto` | `ScoreProposalCommandInputDto` |
| Output DTO | `[Handler]OutputDto` | `ScoreProposalCommandOutputDto` |

## Critical Rules

1. **Both decorators ALWAYS**: `@injectable()` + `@injectFromBase()` + `super()`.
2. **Logger via BaseUseCase**: use `this.logger`, never inject logger in constructor.
3. **One handler = one responsibility**. For complex flows, compose handlers.
4. **Handler-specific DTOs**: NEVER share DTOs between handlers.
5. **ALL business logic HERE**: Controllers only call handlers.
6. **Depend on ports only**: never import concrete implementations.
7. **Single DTO file per handler**: Input + Output DTOs ALWAYS in one file: `[HandlerName]Dto.ts`.

## Pre-Implementation Checklist

- [ ] Is this a Command (write) or Query (read)?
- [ ] Does a similar handler already exist? (`grep -r "Handler" packages/application/src`)
- [ ] Created DTOs in a single file (input + output)?
- [ ] Handler extends `BaseUseCase`?
- [ ] Added BOTH `@injectable()` AND `@injectFromBase()`?
- [ ] Called `super()` in constructor?
- [ ] Added to module `types.ts`?
- [ ] Exported from module `index.ts`?
- [ ] Updated central `types.ts`?
- [ ] Registered in `ApplicationModule.ts`?
