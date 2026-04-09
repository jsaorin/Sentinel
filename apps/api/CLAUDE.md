# Presentation Layer — apps/api

REST API entry point. Controllers validate input, call application handlers, and map responses. **ZERO business logic.**

## Structure

```
apps/api/src/
├── presentation/
│   ├── health/
│   │   ├── HealthController.ts
│   │   └── health.route.ts
│   └── [domain]/
│       ├── [Entity]Controller.ts
│       ├── [entity].route.ts
│       └── dtos/
│           └── [Request]Params.ts
├── container/
│   ├── types.ts
│   ├── config/
│   │   ├── configTypes.ts
│   │   └── configBinding.ts
│   └── controller/
│       ├── controllerTypes.ts
│       └── controllerBinding.ts
├── middlewares/
│   └── errorHandler.ts
├── env/
│   ├── api-environment.ts
│   └── env-validation.config.ts
├── logger/
│   └── logger.ts
├── inversify.config.ts
├── app.ts
└── index.ts
```

## Controller Pattern

**ALL controllers MUST extend `Api`** from `@sentinel/common/api`. This provides `this.send()` for standardized responses and `this.logger` / `this.environment`.

Controllers do exactly 3 things: call handler → map to DTO → send response.

**Validation happens in the ROUTE as middleware, NOT in the controller.**

```typescript
import { Api } from "@sentinel/common/api";
import type { MultisigDto } from "@sentinel/common/dtos";
import environment from "../../env/api-environment.js";
import { logger } from "../../logger/logger.js";

@injectable()
export class MultisigController extends Api {
  constructor(
    @inject(APPLICATION_TYPES.CreateMultisigCommandHandler)
    private createMultisigHandler: CreateMultisigCommandHandler
  ) {
    super(logger, environment); // REQUIRED: pass logger + environment to Api base
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.createMultisigHandler.execute(req.body);

      const dto: MultisigDto = {
        id: result.id,
        address: result.address,
        label: result.label,
        createdAt: result.createdAt,
      };

      this.send(res, dto, 201); // ALWAYS use this.send, NEVER res.json directly
    } catch (e) {
      next(e);
    }
  }
}
```

## Response DTOs

**ALL responses MUST use DTOs defined in `@sentinel/common/dtos`**, NOT raw handler output. This allows the frontend to import the same DTOs for type safety.

```typescript
// packages/common/src/dto/MultisigDto.ts
export class MultisigDto {
  id: string;
  address: string;
  label: string | null;
  createdAt: string;
}
```

## Request Validation — Middleware Pattern

Validation is done via `BodyValidator` or `QueryValidator` middleware in the route definition. The controller receives already-validated `req.body`/`req.query`.

```typescript
// Zod schema for request validation
// presentation/[domain]/dtos/[Action]Params.ts
import { z } from "zod";

export const CreateMultisigSchema = z.object({
  address: z.string(),
  label: z.string().max(255).optional(),
});
```

## Route Definition

Use `.bind(controller)` to attach handlers — **never use arrow function wrappers**.

```typescript
import { BodyValidator } from "@sentinel/common/middlewares";
import { logger } from "../../logger/logger.js";

const router: Router = Router();
const controller = container.get<MultisigController>(CONTROLLER_TYPES.MultisigController);

// Validation middleware goes BEFORE the controller handler
router.post(
  "/multisigs",
  BodyValidator.validate(logger, CreateMultisigSchema),
  controller.create.bind(controller),
);

// Without body validation
router.get("/health", controller.health.bind(controller));
```

- **`BodyValidator.validate(logger, schema)`** — validates `req.body` against a Zod schema
- **`QueryValidator.validate(logger, schema)`** — validates `req.query` against a Zod schema

Both live in `@sentinel/common/middlewares`.

## IoC Registration

```typescript
// container/controller/controllerTypes.ts
export const CONTROLLER_TYPES = {
  HealthController: Symbol.for("HealthController"),
  MultisigController: Symbol.for("MultisigController"),
} as const;

// container/controller/controllerBinding.ts
options.bind(CONTROLLER_TYPES.MultisigController).to(MultisigController);
```

## Critical Rules

1. **ALL controllers extend `Api`** — `super(logger, environment)` in constructor. Use `this.send()` for responses.
2. **ALL responses use DTOs from `@sentinel/common/dtos`** — never send raw handler output directly.
3. **Validation in middleware, NOT in controller** — use `BodyValidator.validate` / `QueryValidator.validate` in route.
4. **NO business logic in controllers** — just call handler, map to DTO, send.
5. **Always wrap in try/catch** — pass errors to `next()`.
6. **Thin controllers** — if your method is longer than ~15 lines, logic is leaking in.

## Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Controller | `[Entity]Controller` | `MultisigController` |
| Route File | `[entity].route.ts` | `multisig.route.ts` |
| Request Schema | `[Action][Entity]Schema` (Zod) | `CreateMultisigSchema` |
| Response DTO | `[Entity]Dto` (in common) | `MultisigDto` |

## Pre-Implementation Checklist

- [ ] Does the Application handler exist?
- [ ] Created response DTO in `@sentinel/common/dtos`?
- [ ] Created request validation schema (Zod) in `presentation/[domain]/dtos/`?
- [ ] Controller extends `Api` with `super(logger, environment)`?
- [ ] Controller uses `this.send()` with the response DTO?
- [ ] Validation middleware in route, NOT in controller?
- [ ] Zero business logic in the controller?
- [ ] Added controller to controllerTypes?
- [ ] Registered controller in controllerBinding?
- [ ] Created route file with validator middleware?
- [ ] Added route to main router (`presentation/routes.ts`)?
