# Observability Platform (`platform/observability/`)

Status: **CANONICAL OBSERVABILITY CONTRACT**

This package owns backend structured logging, correlation, privacy redaction and readable Development/Staging diagnostic presentation. It observes execution without becoming a business-policy authority.

## One logging architecture

```text
PRODUCTION
Fastify / application
  -> canonical Pino configuration
  -> platform/observability redaction
  -> metadata-first structured operational logs
  -> NO request/response payload logging

DEVELOPMENT / STAGING
Fastify request
  -> request-flow.plugin.ts
  -> platform/observability diagnostic formatters
  -> FLOW / API REQUEST / API RESPONSE / API ERROR
  -> privacy-safe readable console
```

Fastify automatic request logging is disabled. `request-flow.plugin.ts` is the single HTTP lifecycle owner. Do not add another Pino instance, request logger middleware, body logger, console logger utility or route-specific HTTP logging stack.

## Environment policy

Detailed readable diagnostics are enabled only for Development/Staging. Production keeps privacy-safe structured operational logging. Environment selection must remain owned by `diagnostic-mode.ts`; privacy rules do not weaken in Development/Staging.

## Request diagnostic contract

Request lifecycle diagnostics are **metadata-first and payload-free in every environment**. They may include:

```text
correlationId
method
sanitized route/url
surface
outcome
statusCode
durationMs
errorCode
```

They MUST NOT read or dump:

```text
request.body
request.headers
request.query
reply headers
raw request/response framework objects
```

This rule is deliberate even though the canonical sanitizer can redact known sensitive keys. Avoiding arbitrary request payload/header ingestion is stronger than relying on a continually expanding deny-list and prevents unknown future PII/secrets from reaching diagnostics.

Example Development/Staging request block:

```text
╭─ 🌐 API REQUEST  POST /api/v1/partner/auth/send_otp
│ TRACE    <correlation-id>
│ METHOD   POST
│ URL      /api/v1/partner/auth/send_otp
╰────────────────────────────────────────────────────────
```

Sensitive query-string values are removed/redacted by URL sanitization. Request bodies and headers are never printed.

## Response/error diagnostics

Development/Staging may render the already-produced client response/error envelope for integration debugging because it has passed the API response/error boundary. It still passes through canonical recursive redaction before presentation. Production never emits detailed response/error payload diagnostics.

The API response/error envelope currently uses:

```text
status
code
message
data
traceId
```

Do not document or reintroduce the removed `{ success: boolean }` response format.

## Mandatory redaction

All structured and readable diagnostics reuse the canonical recursive redaction policy. Sensitive values include, non-exhaustively:

```text
authorization / cookies
password / passcode
access / refresh / ID tokens
OTP / mock OTP
phone / mobile / email
address / coordinates / location
card / CVV / UPI / bank details
KYC / document numbers
API keys / provider credentials / secrets
body / payload / rawBody
```

Errors are reduced to safe metadata by the sanitizer; framework/DI internals are not traversed.

## Error ownership

`apps/api/src/transport/middleware/error-handler.ts` owns HTTP error mapping. Observability records technical failure metadata but does not decide response status/code/message.

In Development/Staging the final client-safe error envelope may be rendered once as `API ERROR`. In Production, detailed console diagnostics are disabled and privacy-safe structured error logging remains active.

## Dependency rule

Domains/application use cases must not depend on observability merely to support HTTP console output. Transport/bootstrap and infrastructure adapters emit technical telemetry at their proper boundaries.

## Change rules

- extend the existing observability package; never create a competing logger;
- request lifecycle logs remain payload/header/query free;
- add only stable, useful metadata fields to `FlowLogFields`;
- new sensitive fields must be covered by canonical redaction even if they are not expected in request lifecycle logs;
- provider failures must be observable without leaking provider payloads or credentials;
- direct `console.*` logging and silent empty catches are forbidden in executable production sources.

## Verification

Required focused checks after observability changes:

```text
pnpm exec vitest run platform/observability/tests/logger-redaction.spec.ts
pnpm exec vitest run platform/observability/tests/http-diagnostics.spec.ts
pnpm exec vitest run apps/api/src/bootstrap/config/diagnostic-mode.spec.ts
node tools/cw5-observability-pii-gate.mjs
pnpm --filter @carbroz/platform-observability build
pnpm --filter @carbroz/api build
```

Repository-wide CI remains the final authority. The permanent CW5 PII gate must pass without weakening or bypassing its metadata-first rules.
