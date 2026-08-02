# Phase 1 Walkthrough
**Foundation: DI Container & Architecture Skeleton**

## What was implemented
- **DI Container**: Awilix has been integrated with Fastify in strict, request-scoped mode (`fastify-awilix`). The composition root is properly isolated in `apps/backend-api/src/container`.
- **Architectural Abstractions**: Created the DDD base models and interfaces in `@carbroz/common`. This includes `IEntity`, `IAggregateRoot`, `IDomainEvent`, `IRepository` interfaces, `IUseCase`, `IFactory`, and `IBuilder`.
- **Systemic Providers**: Defined `IProvider`, `IClockProvider`, `IIdGeneratorProvider`, `ITransactionProvider`, and `ILoggerProvider` interfaces in the common package.
- **Request Context**: Designed `IRequestContext` interface for tracing and correlation.
- **Testing**: Replaced Jest with Vitest workspace-wide. Created `vitest.workspace.ts` with 85% coverage threshold and added a base DI resolution test (`index.test.ts`).

## Breaking Changes
- Jest is entirely removed. All future tests must use Vitest.
- `apps/backend-api/tsconfig.json` was modified to remove the `jest` global types.

## Known Blockers (Pending Resolution)
- **ESLint Configuration Missing**: Running `pnpm lint` fails because `eslint.config.js` is missing for ESLint v9+. As per the strict rules, this blocker is documented here and awaits approval for a proper workaround or fix.

## Testing
- `pnpm build` completes successfully.
- `pnpm test` successfully executes the Vitest test suite.
- `pnpm lint` fails due to the missing ESLint configuration file.
