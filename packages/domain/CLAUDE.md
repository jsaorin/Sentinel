# Domain Layer — packages/domain

This is the business core. ZERO external dependencies. If you need to import any library, it does NOT belong here.

## Structure

```
packages/domain/src/
├── entities/           # Domain entities
├── repositories/       # Repository INTERFACES only (ports)
│   └── base/           # IBaseRepository interface
├── services/           # Service INTERFACES only (ports)
├── events/             # Domain events
├── errors/             # Domain-specific errors
├── types.ts            # Inversify injection symbols
└── index.ts            # Public exports
```

## Entities

Entities have identity and contain business validations:

```typescript
// packages/domain/src/entities/Multisig.ts
export class Multisig {
  public id: string;
  public address: string;
  public threshold: number;
  public signers: string[];
  public createdAt: Date;

  constructor(props: {
    id: string;
    address: string;
    threshold: number;
    signers: string[];
    createdAt: Date;
  }) {
    this.id = props.id;
    this.address = props.address;
    this.threshold = props.threshold;
    this.signers = props.signers;
    this.createdAt = props.createdAt;
  }

  public hasQuorum(approvals: number): boolean {
    return approvals >= this.threshold;
  }
}
```

## Repository Interfaces (Ports)

Define contracts WITHOUT implementation details. Never reference Prisma, SQL, or any storage technology:

```typescript
// packages/domain/src/repositories/IMultisigRepository.ts
import type { Multisig } from "../entities/Multisig.js";

export interface IMultisigRepository {
  findById(id: string): Promise<Multisig | null>;
  findByAddress(address: string): Promise<Multisig | null>;
  create(multisig: Multisig): Promise<Multisig>;
}
```

## Domain Events

```typescript
export interface DomainEvent {
  readonly name: string;
  readonly occurredAt: Date;
}
```

## Domain Errors

```typescript
export class ResourceNotFoundError extends Error {
  constructor(resource: string, id?: string) {
    super(id ? `${resource} with id ${id} not found` : `${resource} not found`);
    this.name = "ResourceNotFoundError";
  }
}
```

## Injection Types — 3 Namespaces

`packages/domain/src/types.ts` has 3 separate namespaces. **Always add your symbol to the correct one**:

| Namespace | When to use | Example symbols |
|-----------|-------------|-----------------|
| `DOMAIN_REPOSITORY_TYPES` | New repository interface (`I[Entity]Repository`) | `MultisigRepository`, `ProposalRepository` |
| `DOMAIN_SERVICE_TYPES` | New service port (`I[Feature]Service`) | `CacheService`, `RiskScoringService` |
| `DOMAIN_CONFIG_TYPES` | New config object injected into infrastructure | `SolanaRpcConfig`, `RedisConfig` |

**Decision guide**:
- "Will infrastructure implement this with a database?" → `DOMAIN_REPOSITORY_TYPES`
- "Will infrastructure implement this with an external API, Redis, etc.?" → `DOMAIN_SERVICE_TYPES`
- "Is this just configuration data?" → `DOMAIN_CONFIG_TYPES`

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Entity | PascalCase singular | `Multisig`, `Proposal`, `Signer` |
| Repository Interface | Prefix `I` | `IMultisigRepository`, `IProposalRepository` |
| Service Interface | Prefix `I` | `IRiskScoringService` |
| Domain Event | Past tense | `ProposalCreated`, `RiskScoreUpdated` |
| Domain Error | Suffix `Error` | `ResourceNotFoundError` |

## Critical Rules

1. **ZERO external imports** — no Prisma, no Redis, no Axios, no Express, no SDK.
2. **Interfaces only for data access** — never implement a repository here.
3. **Business validations only** — `if (riskScore > 0.8)` is OK. `if (!prisma.validate())` is NOT.
4. **ESM imports** — always `.js` extension: `import { Multisig } from "./entities/Multisig.js"`
5. **No async for business logic** — domain services/entities should be synchronous where possible.

## Pre-Implementation Checklist

- [ ] Is this a business concept (entity) or just data (DTO)?
- [ ] Does it have identity (entity) or is it compared by value (value object)?
- [ ] Are ALL validations business rules, not technical?
- [ ] Is the repository interface free of implementation details?
- [ ] Zero external dependencies?
- [ ] Added to `types.ts`?
- [ ] Exported from `index.ts`?

## Find Existing Code

```bash
ls packages/domain/src/entities/
ls packages/domain/src/repositories/
grep -r "implements DomainEvent" packages/domain/src/
```
