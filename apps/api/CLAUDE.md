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

Controllers do exactly 3 things: validate → call handler → map response.

```typescript
@injectable()
export class ScoringController {
  constructor(
    @inject(APPLICATION_TYPES.ScoreProposalCommandHandler)
    private scoreProposalHandler: ScoreProposalCommandHandler
  ) {}

  async scoreProposal(req: Request, res: Response, next: NextFunction) {
    try {
      const input = ScoreProposalSchema.parse(req.body);
      const result = await this.scoreProposalHandler.execute(input);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }
}
```

## Route Definition

```typescript
const router: Router = Router();
const controller = container.get<ScoringController>(CONTROLLER_TYPES.ScoringController);

router.post("/score", (req, res, next) => {
  controller.scoreProposal(req, res, next).catch(next);
});

export default router;
```

## IoC Registration

```typescript
// container/controller/controllerTypes.ts
export const CONTROLLER_TYPES = {
  HealthController: Symbol.for("HealthController"),
  ScoringController: Symbol.for("ScoringController"),
} as const;

// container/controller/controllerBinding.ts
options.bind(CONTROLLER_TYPES.ScoringController).to(ScoringController);
```

## Critical Rules

1. **NO business logic in controllers** — just validate, call handler, respond.
2. **Always wrap in try/catch** — pass errors to `next()`.
3. **Use Zod for validation** — parse request params/body before calling handler.
4. **Thin controllers** — if your method is longer than ~15 lines, logic is leaking in.

## Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Controller | `[Entity]Controller` | `ScoringController` |
| Route File | `[entity].route.ts` | `scoring.route.ts` |
| Request DTO | `[Action][Entity]Schema` (Zod) | `ScoreProposalSchema` |

## Pre-Implementation Checklist

- [ ] Does the Application handler exist?
- [ ] Created request validation schema (Zod)?
- [ ] Zero business logic in the controller?
- [ ] Added controller to controllerTypes?
- [ ] Registered controller in controllerBinding?
- [ ] Created route file?
- [ ] Added route to main router (`presentation/routes.ts`)?
