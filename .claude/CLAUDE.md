# Sentinel — Claude Code Context

## Architecture: Hexagonal / DDD / CQRS

This monorepo follows strict layer separation. **Before writing ANY code**, determine which layer it belongs to.

### Quick Layer Decision

> **"If I swap the database, framework, or external provider — does this code break?"**
> - No → Domain or Application
> - Yes → Infrastructure

> **"Can I test this with zero mocks?"**
> - Yes → Domain
> - Yes, but mocking ports → Application
> - No, needs real DB/API → Infrastructure

### Layer Rules

**DOMAIN** (`packages/domain`): Business core, zero external imports.
- Entities, Value Objects, Aggregates, Domain Events, Domain Errors, Repository interfaces (ports), Domain Services.
- If it imports Prisma, Redis, Axios, or any SDK → it does NOT belong here.

**APPLICATION** (`packages/application`): Use case orchestration via CQRS.
- Command Handlers, Query Handlers, Application Services, DTOs, Port interfaces for external services.
- If it instantiates PrismaClient or calls fetch() → it does NOT belong here.

**INFRASTRUCTURE** (`packages/infrastructure`): Concrete implementations.
- Repository implementations, External API clients, Cache adapters, Message queue adapters, Mappers (Prisma↔Domain).
- If it contains business `if` logic (e.g. `if (riskScore > threshold)`) → that logic belongs in Domain.

**PRESENTATION** (`apps/*`): Entry points, zero business logic.
- Controllers, Routes, Middleware, Event handlers (Reactor).
- If it does more than validate input → call handler → map response → it's doing too much.

### Dependency Rule (NEVER violate)

```
Presentation → Application → Domain
Infrastructure → Domain (implements ports)
Infrastructure → Application (implements ports)

Domain NEVER imports from Application, Infrastructure, or Presentation.
Application NEVER imports from Infrastructure or Presentation.
```

### Smell Tests

- **Domain imports a library?** → Extract to infrastructure, keep interface in domain.
- **Application instantiates a client?** → Use a port.
- **Infrastructure has business conditionals?** → Move rule to domain entity/service.
- **Controller has logic beyond validate/call/map?** → Move to application handler.

---

## Monorepo Structure

```
sentinel/
├── apps/
│   ├── api/              # REST API (Express)
│   └── reactor/          # AMQP event consumer
├── packages/
│   ├── domain/           # Entities, interfaces, events, errors
│   ├── application/      # Command/Query handlers, DTOs, business logic
│   ├── infrastructure/   # Prisma repos, API clients, cache, mappers
│   └── common/           # Shared: logger, errors, environment, utilities
```

---

## Universal Rules

1. **Package manager**: `pnpm` only. Never npm, never yarn.
2. **ESM imports**: Always use `.js` extension in relative imports.
3. **Package aliases**: `@sentinel/domain`, `@sentinel/application`, `@sentinel/infrastructure`, `@sentinel/common`.
4. **IoC**: Inversify for ALL dependency injection. No manual instantiation of services.
5. **Search first**: Always look for similar existing code before creating new files.
6. **Logger**: `ILogger` lives in `@sentinel/common/logger`, NOT in `@sentinel/domain`.
7. **Handler decorators**: ALL handlers need both `@injectable()` AND `@injectFromBase()`, plus `super()` in constructor.
8. **Git**: Conventional branch naming.

---

## Essential Commands

```bash
pnpm dev:api            # API only
pnpm dev:reactor        # Reactor only
pnpm build              # Build monorepo
pnpm format             # Format with Biome
pnpm lint               # Lint with Biome
pnpm prisma:generate    # Generate Prisma client
pnpm db:migrate         # Run migrations
```

---

## Development Workflow

### Adding a New Feature

1. Define entity in `packages/domain/src/entities/`
2. Define repository interface in `packages/domain/src/repositories/`
3. Add DI symbol to `packages/domain/src/types.ts`
4. Create use case in `packages/application/src/usecases/<feature>/`
5. Implement repository in `packages/infrastructure/src/repositories/`
6. Add Prisma model in `packages/infrastructure/src/prisma/schema/`
7. Wire DI bindings in the corresponding container modules
8. Create controller + route in `apps/api/src/presentation/<feature>/`

---

## Agent Team Configuration

### Team Roles

When working as an agent team on this project, these are the roles and boundaries:

#### Domain Teammate
- **Owns**: `packages/domain/`
- **Creates**: Entities, repository interfaces, domain events, domain errors, value objects
- **Must read**: `packages/domain/CLAUDE.md`
- **Rule**: ZERO external dependencies. Pure business logic only.

#### Application Teammate
- **Owns**: `packages/application/`
- **Creates**: Command handlers, query handlers, DTOs, port interfaces
- **Must read**: `packages/application/CLAUDE.md`
- **Rule**: ALL business logic lives here. Never import from infrastructure or presentation.
- **Depends on**: Domain teammate completing entities and interfaces first.

#### Infrastructure Teammate
- **Owns**: `packages/infrastructure/`
- **Creates**: Repository implementations, external API clients, mappers, cache adapters
- **Must read**: `packages/infrastructure/CLAUDE.md`
- **Rule**: NO business logic. Only data adaptation and external system integration.
- **Depends on**: Domain teammate completing repository interfaces.

#### Presentation Teammate
- **Owns**: `apps/api/`, `apps/reactor/`
- **Creates**: Controllers, routes, event handlers, request validation schemas
- **Must read**: Target app's `CLAUDE.md`
- **Rule**: Thin layer. Validate input → call handler → map response. Nothing else.
- **Depends on**: Application teammate completing handlers.

### File Ownership (CRITICAL — prevents merge conflicts)

Each teammate ONLY modifies files within their owned directories. Shared files that multiple teammates might touch (like `packages/domain/src/types.ts`) should be updated by the teammate who owns that package.

### Task Dependency Chain

```
domain:entities ─────→ application:handlers ──→ presentation:controllers
domain:interfaces ──→ infrastructure:repos ──→ presentation:controllers
domain:events ──────→ application:event-mappers
domain:types ───────→ application:types ─────→ app:inversify.config
```

---

## Layer-Specific Documentation

Each package has its own CLAUDE.md with detailed patterns, examples, and checklists. **Teammates must read their layer's CLAUDE.md before writing any code.**

- `packages/domain/CLAUDE.md` — Entity patterns, repository interfaces, service ports, domain events
- `packages/application/CLAUDE.md` — CQRS handlers, DTOs, BaseUseCase, IoC registration
- `packages/infrastructure/CLAUDE.md` — Prisma repositories, external clients, mappers
- `apps/api/CLAUDE.md` — Controllers, routes, request validation
- `apps/reactor/CLAUDE.md` — Event handlers, subscriptions

---

## Post-Team Checklist

After an agent team completes, verify:

- [ ] `pnpm build` passes with zero errors
- [ ] `pnpm lint` passes with zero errors
- [ ] All IoC registrations are in place (types.ts, modules, inversify.config)
- [ ] All exports are in place (index.ts for each package)
- [ ] No domain imports from application/infrastructure/presentation
- [ ] No application imports from infrastructure/presentation
- [ ] No business logic in controllers or repositories
- [ ] All handlers have `@injectable()` + `@injectFromBase()` + `super()`
- [ ] All relative imports use `.js` extension
- [ ] Mappers exist for all Prisma↔Domain conversions
