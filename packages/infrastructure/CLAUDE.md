# Infrastructure Layer — packages/infrastructure

Implements domain/application ports with concrete technologies. Adapts data between external systems and domain entities. Contains NO business logic.

## Structure

```
packages/infrastructure/src/
├── repositories/          # Prisma repository implementations
├── clients/               # External API clients (Solana RPC, etc.)
├── mappers/               # Prisma ↔ Domain transformation
├── events/                # Event publishing (RabbitMQ)
├── prisma/                # Prisma configuration
│   ├── schema/            # Modular .prisma files
│   ├── seed/              # Database seeding
│   ├── index.ts           # Re-exports Prisma client
│   └── prisma-client-factory.ts
├── config/                # Environment config
│   └── environment.ts
├── container/             # IoC modules
│   ├── RepositoryModule.ts
│   ├── ServiceModule.ts
│   └── PortModule.ts
└── types.ts               # Infrastructure injection symbols
```

## Repository Implementation

Repositories implement domain interfaces and use Prisma for data access:

```typescript
// packages/infrastructure/src/repositories/MultisigRepository.ts

import type { IMultisigRepository, Multisig } from "@sentinel/domain";
import { injectable } from "inversify";
import { getPrismaClient } from "../prisma/prisma-client-factory.js";
import { mapPrismaMultisigToDomain } from "../mappers/MultisigMapper.js";

@injectable()
export class MultisigRepository implements IMultisigRepository {
  private get prisma() {
    return getPrismaClient();
  }

  async findById(id: string): Promise<Multisig | null> {
    const record = await this.prisma.multisig.findUnique({ where: { id } });
    return record ? mapPrismaMultisigToDomain(record) : null;
  }
}
```

## Data Mappers

Transform between Prisma models and domain entities. **Never return Prisma models directly.**

```typescript
// packages/infrastructure/src/mappers/MultisigMapper.ts

import type { Multisig as PrismaMultisig } from "@prisma/client";
import { Multisig } from "@sentinel/domain";

export function mapPrismaMultisigToDomain(record: PrismaMultisig): Multisig {
  return new Multisig({
    id: record.id,
    address: record.address,
    threshold: record.threshold,
    signers: record.signers,
    createdAt: record.createdAt,
  });
}
```

## Prisma Schema (Modular)

Schema is split by domain area in `src/prisma/schema/`:

```
schema/
├── base.prisma          # Generator + datasource config
└── <domain>.prisma      # Add new schema files per domain
```

**Rules:**
- One migration per feature: `prisma migrate dev --name <name> --create-only`
- NEVER create migration files manually
- NEVER put INSERT statements in migration files — use `prisma/seed/`

## IoC Registration

Infrastructure has **3 container modules**. Each new implementation must be registered in the correct module:

| What you're adding | Register in | Bind against |
|--------------------|-------------|--------------|
| Repository | `RepositoryModule.ts` | `DOMAIN_TYPES.[Entity]Repository` |
| Service / Client / Adapter | `ServiceModule.ts` | `DOMAIN_TYPES.[Service]` |
| Port implementation (EventPublisher, etc.) | `PortModule.ts` | `APPLICATION_TYPES.[Port]` |

```typescript
// RepositoryModule.ts
bind(DOMAIN_TYPES.MultisigRepository).to(MultisigRepository).inSingletonScope();

// ServiceModule.ts
bind(DOMAIN_TYPES.CacheService).to(RedisCacheService).inSingletonScope();

// PortModule.ts
bind(APPLICATION_TYPES.EventPublisher).to(RabbitMqEventPublisher).inSingletonScope();
```

## Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Repository | `[Entity]Repository` | `MultisigRepository` |
| Mapper (to domain) | `mapPrisma[Entity]ToDomain` | `mapPrismaMultisigToDomain` |
| Mapper (from domain) | `mapDomain[Entity]ToPrisma` | `mapDomainMultisigToPrisma` |
| Client | `[Service]Client` | `SolanaRpcClient` |

## Critical Rules

1. **NO business logic** — infrastructure adapts data, it doesn't decide:
   ```typescript
   // ❌ WRONG
   async create(input): Promise<Multisig> {
     if (input.threshold > input.signers.length) throw new Error("Invalid"); // Business rule!
   }

   // ✅ CORRECT — just persist and map
   async create(input): Promise<Multisig> {
     const record = await this.prisma.multisig.create({ data: input });
     return mapPrismaMultisigToDomain(record);
   }
   ```

2. **Always use mappers** — never return Prisma models to the application layer.
3. **Implement domain interfaces** — `implements IMultisigRepository`.
4. **ILogger from common** — `import type { ILogger } from "@sentinel/common/logger"`.
5. **ESM imports** — always `.js` extension.
6. **Specific errors for external services** — don't throw generic `Error`.

## Pre-Implementation Checklist

- [ ] Does a domain interface (port) exist for this?
- [ ] Created mapper functions (both directions if needed)?
- [ ] Repository implements the domain interface?
- [ ] Handled null cases properly?
- [ ] Zero business logic in the implementation?
- [ ] Registered in the correct container module?
