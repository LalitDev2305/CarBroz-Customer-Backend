# API Response Contract

This folder owns the canonical HTTP response envelope for `apps/api`. It is a transport concern and does not move business, domain, persistence or SDUI ownership into the API layer. The normative architecture authority remains `docs/MASTER-BACKEND-CONSTITUTION.md`.

## Phase 2 status

Repository-wide response/error reconciliation is implemented and frozen here. This folder is the single transport owner for response envelopes and error mapping; product surfaces must reuse it rather than define local response helpers or status maps. Phase 2 acceptance requires the canonical backend CI to pass error/PII architecture gates, Prisma checks, monorepo build, ESLint, full Vitest, post-test re-verification and the non-mutating validation proof on the documentation-complete HEAD.

## Canonical envelope

Successful and mapped failed JSON responses use one transport shape:

```text
ApiResponse<T>
├── status   actual HTTP status repeated in the body
├── code     stable machine-readable result/error code
├── message  client-safe human-readable message
├── data     successful resource; null for mapped failures
└── traceId  request correlation identifier when available
```

Rules:

- actual HTTP status and body `status` MUST be identical;
- clients MUST branch on `status`/`code`, never message text;
- successful JSON responses use `data` for the result;
- mapped failures use `data: null`;
- `traceId` is propagated whenever request context provides it;
- no controller/product surface may define a competing response envelope or status map.

## Status policy

| HTTP/body status | default code | Meaning |
| ---: | --- | --- |
| 200 | `SUCCESS` | Successful request, including the currently frozen creation contract |
| 400 | `BAD_REQUEST` | Malformed/invalid transport input |
| 401 | `UNAUTHORIZED` | Authentication missing or invalid |
| 403 | `FORBIDDEN` | Authenticated caller not permitted |
| 404 | `NOT_FOUND` | Requested resource/route does not exist |
| 409 | `CONFLICT` | Current state conflicts with request |
| 422 | `UNPROCESSABLE_ENTITY` | Valid transport shape but domain/business input cannot be processed |
| 429 | `TOO_MANY_REQUESTS` | Transport/API rate limit exceeded |
| 500 | `INTERNAL_SERVER_ERROR` | Unexpected server failure |
| 503 | `SERVICE_UNAVAILABLE` | Required infrastructure/provider dependency unavailable |

`ResponseHelper.error()` owns the default HTTP-status-to-code mapping. A typed `ApplicationError` or `DomainError` may preserve its more-specific stable code while keeping the same envelope and HTTP status. Transport must not rewrite a domain/application code into message text.

## Creation and no-content policy

The current CarBroz creation contract remains **HTTP 200**, so `ResponseHelper.created()` deliberately delegates to `success()`. Introducing HTTP 201 is a separate API-version/contract decision and must not happen implicitly.

HTTP 204 means **no response body**. `ResponseHelper.noContent()` returns `void`; callers that select status 204 must not send an envelope body.

## Error boundary

`apps/api/src/transport/middleware/error-handler.ts` is the single global error mapper.

Mapping rules:

- `ApplicationError`/`AppError`: use its supported status; preserve its stable `errorCode`/`code`; client-safe 4xx messages may pass through; 5xx details are suppressed;
- `DomainError`: preserve its stable domain code; map `_UNAUTHORIZED` → 401, `_FORBIDDEN` → 403, `_NOT_FOUND` → 404, `_CONFLICT` → 409; other domain/business validation failures default to 422;
- Zod/Fastify validation: 400 + `VALIDATION_ERROR`, with one generic safe message and no reflected schema details;
- unknown/unhandled exception: 500 + `INTERNAL_SERVER_ERROR`, with one generic safe message;
- required dependency/provider failures represented by typed application errors may map to 503 + their stable application code;
- raw validation details, stack traces, SQL/provider errors, secrets, tokens, OTPs and unnecessary PII MUST never be reflected to clients.

Server-side logging may contain structured error objects subject to the repository observability/PII rules; client containment must never depend on `NODE_ENV`.

## Route-not-found behavior

The Fastify not-found handler uses the same `ResponseHelper` envelope:

```json
{
  "status": 404,
  "code": "NOT_FOUND",
  "message": "The requested route could not be found.",
  "data": null,
  "traceId": "request-trace-id"
}
```

The raw request URL is not reflected in the client message.

## Example success

```json
{
  "status": 200,
  "code": "SUCCESS",
  "message": "Partner login screen fetched successfully.",
  "data": {
    "screenId": "partner_login",
    "schemaVersion": "3.0.0",
    "targetApp": "PARTNER",
    "theme": {},
    "template": {}
  },
  "traceId": "request-trace-id"
}
```

## Example typed domain failure

```json
{
  "status": 409,
  "code": "BOOKING_SLOT_CONFLICT",
  "message": "Selected service slot is no longer available",
  "data": null,
  "traceId": "request-trace-id"
}
```

## Verification requirements

Phase/release validation must prove:

- every supported status maps to the expected default code;
- specific application/domain codes are preserved;
- HTTP status equals body `status`;
- `data` is null for mapped failures;
- validation details are contained;
- unhandled/server-error details are contained;
- 503 is supported for required dependency failure;
- `created()` remains 200 under the frozen contract;
- 204 carries no envelope body;
- unknown routes are non-reflective;
- the CW5 executable gate validates the current canonical contract rather than a removed legacy `{ success: false }` envelope.
