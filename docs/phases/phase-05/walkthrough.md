# Phase 5 Walkthrough: Edge Security

## Goal
The goal of this phase was to establish Edge Security by implementing rate limiting against DDoS/brute-force attacks and modernizing the application logging strategy by replacing `console.log` with the structured Pino logger.

## Changes Made
- **Dependencies**: Added `@fastify/rate-limit` to `apps/backend-api/package.json`.
- **Rate Limiting**: Registered the rate limiting plugin globally within `apps/backend-api/src/app.ts`. We configured the default in-memory store (a Redis provider is planned for a future phase) with a limit of 100 requests per minute.
- **Error Standardization**: Customized the `@fastify/rate-limit` error response using the system's `ResponseHelper.error()` standard to return a cohesive `TOO_MANY_REQUESTS` JSON response format.
- **Logging Modernization**: Modified the `preHandler` and `onSend` global hooks inside `apps/backend-api/src/app.ts`. We removed all instances of `console.log` and replaced them with `request.log.info()` and `request.log.debug()`, properly utilizing Fastify's integrated Pino instance (`@carbroz/logger`).

## Verification Steps
- **Lint**: Executed `pnpm lint`, confirming codebase cleanliness.
- **Build**: Executed `pnpm build`, ensuring all packages compile successfully under TypeScript.
- **Test**: Executed `pnpm test`, ensuring no architectural breakage in existing modules (29 tests passed).
- **Architecture Validation**: Confirmed that the `app.ts` modifications remained within the outermost Fastify delivery layer, keeping domain logic pristine.
