# Common Layer — packages/common

Shared foundational library used by ALL packages and apps. Provides types, utilities, logger, errors, and configuration. Contains NO business logic and NO external service implementations.

## Structure

```
packages/common/src/
├── logger/            # ILogger interface + Pino implementation
├── errors/            # ServiceError base class
├── env/               # IEnvironment interface + Environment implementation
├── utils/             # Shared utilities
└── index.ts           # Root re-exports
```

## Import Patterns

Two import strategies are available:

```typescript
// Root import (everything)
import { Environment, Environments } from "@sentinel/common";

// Subpath import (recommended — tree-shakable)
import { ILogger, LoggerWrapper } from "@sentinel/common/logger";
import { ServiceError } from "@sentinel/common/errors";
import { generateSomeUtil } from "@sentinel/common/utils";
```

## Key Modules

### Logger

`ILogger` — Interface for structured logging.

```typescript
interface ILogger {
  info(message: string, metadata?: object): void;
  error(message: string, metadata?: object): void;
  debug(message: string, metadata?: object): void;
  warning(message: string, metadata?: object): void;
}
```

- `LoggerWrapper` — Concrete Pino-based implementation with app name enrichment.

**Where to inject**: `APPLICATION_TYPES.Logger` (bound in each app's `configBinding.ts`).

### Errors

```
ServiceError          — Base service-level failure (maps to 400)
```

### Environment

```typescript
interface IEnvironment {
  getCurrentEnvironment(): Environments;
  isProd(): boolean;
  isDev(): boolean;
  isTest(): boolean;
  isLocal(): boolean;
}
```

Base class `Environment` handles `.env` file resolution and validation with `envalid`. Apps extend it with their own env vars (e.g., `ApiEnvironment`, `ReactorEnvironment`).

## Critical Rules

1. **ZERO business logic** — common provides utilities and interfaces, not decisions.
2. **ZERO domain imports** — never import from `@sentinel/domain`, `@sentinel/application`, or `@sentinel/infrastructure`.
3. **Search before creating** — check existing utils before adding duplicates.
4. **ESM imports** — always `.js` extension.

## Pre-Implementation Checklist

- [ ] Does a similar utility already exist? (`grep -r "ClassName" packages/common/src/`)
- [ ] Is this truly shared across multiple packages? (If only one package needs it, put it there instead)
- [ ] Zero imports from domain/application/infrastructure?
- [ ] Added to the correct subpath export?
- [ ] Exported from `index.ts`?
- [ ] ESM `.js` extensions on all relative imports?
