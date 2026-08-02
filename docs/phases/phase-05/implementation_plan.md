# Phase 5 Implementation Plan

## Goal Description

Establish the Edge Security perimeter for the CarBroz Backend Platform. This phase aims to secure the API against DDoS and brute-force attacks by implementing Rate Limiting, while also resolving existing technical debt by modernizing the logging strategy at the edge.

## User Review Required

> [!WARNING]
> Please confirm if in-memory rate limiting is acceptable for this phase, as Redis has not yet been implemented (scheduled for later). The in-memory store will be sufficient for development and testing until the cache provider is established.

## Proposed Changes

### Configuration & Dependencies
- **[MODIFY]** [apps/backend-api/package.json](file:///d:/Backend/CarBroz/backend/apps/backend-api/package.json)
  - Add `@fastify/rate-limit` to dependencies.

### Application Layer
- **[MODIFY]** [apps/backend-api/src/app.ts](file:///d:/Backend/CarBroz/backend/apps/backend-api/src/app.ts)
  - Register and configure `@fastify/rate-limit` globally (e.g., limit of 100 requests per minute per IP).
  - Configure the rate limit error response to match the global `ResponseHelper` standard.
  - Remove all `console.log` statements inside the `preHandler` and `onSend` hooks.
  - Replace `console.log` with structured `request.log.info()` and `request.log.debug()` utilizing the Pino logger configured via `@carbroz/logger`.

## Verification Plan

### Automated Tests
- Run `pnpm test` to ensure global hooks and rate limit configuration do not break existing UseCase tests.
- (Optional) Add a basic rate limiting test if necessary to ensure 429 is returned.

### Manual Verification
- Execute `pnpm build` and `pnpm lint`.
- Verify the server starts successfully without logging `console.log` noise.
- Verify structured JSON logs are output in production mode and pretty logs in development mode.
