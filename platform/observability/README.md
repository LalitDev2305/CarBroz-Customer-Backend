# Observability Platform (`platform/observability/`)

Status: **CANONICAL OBSERVABILITY CONTRACT**

This package owns backend structured logging, correlation, privacy redaction and the readable Development/Staging diagnostic presentation. It observes business execution without becoming a business-policy authority.

## 1. One logging architecture only

CarBroz does not create a second logger for local debugging.

```text
PRODUCTION
Fastify / application
  -> canonical Pino configuration
  -> platform/observability redaction
  -> structured operational logs
  -> NO request/response payload logging

DEVELOPMENT / STAGING
Fastify request
  -> request-flow.plugin.ts
  -> platform/observability diagnostic formatters
  -> FLOW / API REQUEST / API RESPONSE / API ERROR
  -> sanitized readable console
```

Fastify automatic request logging is disabled. `request-flow.plugin.ts` is the single HTTP lifecycle owner, so duplicate `incoming request` / `request completed` lines must not be re-enabled.

Do not add another Pino instance, request logger middleware, body logger, console logger utility or route-specific HTTP logging stack.

## 2. Environment policy

Detailed readable diagnostics are enabled only for:

```text
CARBROZ_ENVIRONMENT=development
CARBROZ_ENVIRONMENT=staging
```

Recommended staging runtime:

```text
NODE_ENV=production
CARBROZ_ENVIRONMENT=staging
```

Production:

```text
NODE_ENV=production
CARBROZ_ENVIRONMENT=production
```

Production never emits the detailed FLOW/API request/response console. It retains privacy-safe structured operational logging.

When `CARBROZ_ENVIRONMENT` is absent, `NODE_ENV=development` enables the local diagnostic console for backwards-compatible local startup. `NODE_ENV=test` and `NODE_ENV=production` do not.

## 3. Development/Staging console contract

Only meaningful application API diagnostics are shown. Health/static traffic and framework request noise are excluded.

### Flow

```text
▶️ FLOW  partnerBootstrapRoutes.GET(/bootstrap) → PartnerBootstrapController.get()  [trace]
▶️ FLOW  PartnerBootstrapController.get() → GetPartnerBootstrapUseCase.execute()  [trace]
▶️ FLOW  GetPartnerBootstrapUseCase.execute() → ResponseHelper.success()  [trace]
```

A supplied bearer adds the real authentication handoff:

```text
▶️ FLOW  PartnerBootstrapController.get() → FastifyRequest.jwtVerify()  [trace]
```

Flow messages describe actual source-level handoffs; do not invent conceptual calls that are not present in the executing path.

### API request

```text
╭─ 🌐 API REQUEST  GET /api/v1/partner/bootstrap
│ TRACE    <correlation-id>
│ METHOD   GET
│ URL      /api/v1/partner/bootstrap
│ HEADERS
│   {
│     "x-carbroz-app-version": "1.0.0",
│     "x-carbroz-build-number": "1",
│     "x-carbroz-platform": "DESKTOP"
│   }
│ BODY
│   <none>
╰────────────────────────────────────────────────────────
```

For POST/PUT/PATCH requests, JSON request data is pretty printed after redaction.

### API response

```text
╭─ ✅ API RESPONSE  200 GET /api/v1/partner/bootstrap
│ TRACE    <correlation-id>
│ STATUS   200
│ URL      /api/v1/partner/bootstrap
│ TIME     12.5 ms
│ JSON
│   {
│     "success": true,
│     "message": "Partner bootstrap completed",
│     "data": {
│       "config": { ... },
│       "startup": { ... }
│     }
│   }
╰────────────────────────────────────────────────────────
```

### API error

```text
╭─ ❌ API ERROR  400 POST /api/v1/partner/example
│ TRACE    <correlation-id>
│ STATUS   400
│ URL      /api/v1/partner/example
│ ERROR    VALIDATION_ERROR
│ TIME     8.2 ms
│ JSON
│   { ...safe error envelope... }
╰────────────────────────────────────────────────────────
```

## 4. Colors and symbols

Terminal-capable Development/Staging output uses ANSI presentation:

```text
▶️ FLOW          magenta
🌐 API REQUEST   cyan
✅ API RESPONSE  green
❌ API ERROR     red
❌ SERVER ERROR  red
```

Color is presentation only. Correctness must never depend on terminal color support.

## 5. Request fields shown

The HTTP lifecycle logs only useful application headers:

```text
Authorization            # value always redacted
Content-Type
Accept
Idempotency-Key
X-CarBroz-Platform
X-CarBroz-App-Version
X-CarBroz-Build-Number
X-Correlation-Id
X-Request-Id
```

Host/user-agent/connection/framework headers are intentionally omitted unless a proven debugging requirement is added.

Request JSON bodies are shown for Development/Staging because they materially help integration debugging, but every value still passes through the canonical privacy sanitizer.

## 6. Mandatory redaction

Readable diagnostics reuse the same recursive redaction policy as canonical Pino logging. Sensitive data must never be exposed merely because the environment is Development or Staging.

Examples that remain `[REDACTED]` include:

```text
Authorization / cookies
password / passcode
access / refresh / ID tokens
OTP / mock OTP
phone / mobile / email
address / coordinates / location
card / CVV / UPI / bank details
KYC / document numbers
API keys / provider credentials / secrets
```

Sensitive query-string values are redacted as well.

Unknown non-JSON raw payloads are not dumped blindly. File/binary/multipart contents must never become normal console body logs.

## 7. Error ownership

`globalErrorHandler` owns HTTP error mapping.

In Development/Staging it does not print a second Pino error line; the final client-safe response is rendered once by `request-flow.plugin.ts` as `API ERROR`.

In Production, detailed console diagnostics are disabled and the normal privacy-safe structured error logging remains active.

## 8. Bootstrap example end-to-end

```text
Frontend
  -> GET /api/v1/partner/bootstrap

Backend
  -> request-flow.plugin.preHandler
  -> partnerBootstrapRoutes.GET(/bootstrap)
  -> PartnerBootstrapController.get()
  -> optional FastifyRequest.jwtVerify()
  -> request.diScope.resolve(getPartnerBootstrapUseCase)
  -> GetPartnerBootstrapUseCase.execute()
  -> ConfigProvider.get(partner.bootstrap)
  -> evaluated PartnerBootstrapSnapshot
  -> PartnerBootstrapController
  -> ResponseHelper.success()
  -> Fastify onSend
  -> pretty API RESPONSE
```

The domain use case does not depend on `platform/observability` just to produce console messages. Logging must not invert domain dependencies.

## 9. Change rules

When adding a new API, the canonical HTTP request/response logging is automatic through `request-flow.plugin.ts`; do not add request/body logs in the route/controller.

Add explicit `emitFlowDiagnostic(...)` only at high-value class/function handoffs where the call cannot be inferred from the HTTP lifecycle and where the message remains stable and useful. Avoid logging every private helper or loop.

When adding a sensitive field, extend canonical redaction before relying on Development/Staging body output.

When adding a new environment, update and test `diagnostic-mode.ts`; never infer Production diagnostics from log level alone.

## 10. Verification

Required focused checks after observability changes:

```powershell
pnpm exec vitest run platform/observability/tests/logger-redaction.spec.ts
pnpm exec vitest run platform/observability/tests/http-diagnostics.spec.ts
pnpm exec vitest run apps/api/src/bootstrap/config/diagnostic-mode.spec.ts
pnpm --filter @carbroz/platform-observability build
pnpm --filter @carbroz/api build
```

Then run the repository's broader test/build gates before freeze.
