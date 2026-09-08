# CarBroz API

`apps/api` is the executable HTTP composition root for CarBroz Backend V3. It exposes the Partner, Customer and Admin API families, adapts transport data into application contracts, wires domain/application capabilities to infrastructure adapters, and owns process/bootstrap concerns. It does **not** own CarBroz business rules.

The normative architecture authority is [`docs/MASTER-BACKEND-CONSTITUTION.md`](../../docs/MASTER-BACKEND-CONSTITUTION.md). This README documents the checked-in API package at the current canonical topology; it does not redefine the constitution.

## Ownership boundary

The API package owns:

- Fastify process startup and application composition;
- transport routes, controllers, DTO validation and response mapping;
- authentication/authorization transport integration and request guards;
- construction/adaptation of the canonical `ExecutionContext` at the transport/bootstrap boundary;
- dependency wiring in the bootstrap container;
- technical request lifecycle hooks and API health endpoints.

The API package must **not** own:

- domain entities, value objects or state machines;
- application/business use cases or business orchestration;
- canonical business repository interfaces or Prisma business repositories;
- pricing, Booking, Partner, Customer, Financials, KYC or other bounded-context policy;
- vendor SDK business behavior;
- generic SDUI schema/definition/compiler ownership;
- a second runtime context type or compatibility business implementation.

Business behavior belongs to its owning `domains/*` bounded context. Generic SDUI vocabulary/composition belongs to `sdui/ui-sdk`; SDUI draft/publish/version lifecycle belongs to `sdui/registry`. Technical infrastructure belongs to `platform/*`.

## Canonical directory structure

```text
apps/api/
├── src/
│   ├── bootstrap/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── config/
│   │   ├── container/
│   │   ├── lifecycle/
│   │   └── plugins/
│   ├── surfaces/
│   │   ├── partner/
│   │   ├── customer/
│   │   └── admin/
│   ├── transport/
│   │   ├── auth/
│   │   ├── corporate/
│   │   ├── guards/
│   │   ├── middleware/
│   │   ├── response/
│   │   └── sdui/
│   └── system/
│       └── health/
├── public/
├── package.json
└── tsconfig.json
```

The four canonical `src` roots are `bootstrap`, `surfaces`, `transport`, and `system`. Legacy `src/context`, `src/modules`, and parallel business-owner trees must not return.

## Runtime request flow

A normal request follows this direction:

```text
HTTP request
  -> Fastify bootstrap/plugins
  -> product surface route
  -> DTO / Zod validation
  -> authentication + authorization guard
  -> canonical ExecutionContext adaptation
  -> owning-domain application use case
  -> domain policy / declared ports
  -> domain infrastructure or platform integration adapter
  -> typed result/error
  -> transport response/error mapping
  -> HTTP response + technical observability
```

`src/bootstrap/server.ts` starts the process. `src/bootstrap/app.ts` composes Fastify and the registered plugins/surfaces. Product transport is isolated under `/api/v1/partner/*`, `/api/v1/customer/*`, and `/api/v1/admin/*`; one surface must not import another surface's internals.

## API route naming

Public product routes follow the resource/capability shape:

```text
/api/v1/{surface}/{resource}[/{sub-resource}][/{action}]
```

`surface` identifies the client/product boundary (`partner`, `customer`, `admin`). The next segment identifies a public capability or resource such as `config`, `screen`, `auth`, `profile`, `bookings`, or `kyc`. Internal DDD terms such as `domain` must not appear merely to mirror backend module structure.

Use HTTP methods and resource names to express ordinary CRUD semantics; do not add redundant path verbs such as `/list` or `/get`. Explicit action segments are reserved for genuine commands such as accepting or rejecting a booking.

Current Partner examples:

```text
GET  /api/v1/partner/config/bootstrap
GET  /api/v1/partner/screen/auth_login
POST /api/v1/partner/auth/send-otp
```

Screen retrieval and business execution remain distinct: `/screen/*` returns an SDUI screen resource, while `/auth/*` and other capability routes execute their owning application behavior. Public route names do not change domain ownership or dependency direction.

## ExecutionContext

There is one canonical application request context: `ExecutionContext`. API transport/framework details are adapted into it at the boundary; application use cases must not receive Fastify request objects or a parallel `IRequestContext` abstraction.

The checked-in transport adapter is owned by:

```text
src/bootstrap/lifecycle/toExecutionContext.ts
```

Its job is translation only: take the authenticated request/runtime identity information approved by the constitution and construct the canonical context expected by application code. Do not recreate `apps/api/src/context` as an alternate authority.

## Dependencies

### Allowed

API composition may depend on:

- bounded-context **public/application contracts** required to execute a request;
- Foundation contracts such as canonical errors/context primitives;
- `sdui/ui-sdk` and `sdui/registry` public contracts where an API surface exposes SDUI capabilities;
- Platform technical capabilities/adapters required for composition;
- Fastify and transport/framework libraries inside the API boundary.

### Forbidden

API code must not:

- deep-import another bounded context's private internals when a public boundary exists;
- use Prisma directly for business persistence;
- implement domain/business repositories in the API package;
- contain provider-specific business policy;
- place business state transitions in controllers/routes;
- import one product surface from another;
- create compatibility aliases that restore deleted architecture.

Dependency direction remains inward: transport/composition depends on application/domain contracts, never the reverse.

## Outbound adapter responsibility

`apps/api` wires outbound implementations; it does not become their business owner.

- Business persistence adapters belong to the owning domain's `infrastructure` area and implement that domain's repository ports.
- Vendor integrations such as payments, SMS/email/push, maps and similar external services belong under `platform/integrations` when they are technical provider implementations.
- Bootstrap/container code selects and injects the implementation into the owning application port.

A provider replacement should therefore be a composition/adapter change, not a rewrite of application orchestration.

## Observability ownership

Technical logging, tracing and metrics are owned by `platform/observability`. API lifecycle hooks may emit request/process events through that capability, including correlation/request metadata, but must not create a competing observability subsystem.

Business/security audit records are different: immutable actor/action audit semantics belong to `domains/audit`.

Logs must not expose OTPs, JWTs, authorization headers, provider secrets, payment secrets or unnecessary PII.

## Extension points

### Add an endpoint

1. Choose exactly one surface: Partner, Customer or Admin.
2. Add route/controller/DTO/validation in that surface.
3. Call a capability exposed by the owning bounded context.
4. Map the typed application result/error to the API contract.
5. Wire new dependencies only in bootstrap composition.

Do not create an API-local business service because a controller needs orchestration.

### Add or change a business rule

Change the owning `domains/*` context. API code should only adapt the transport contract to that capability.

### Add a provider

Define or reuse the inward port owned by the application/domain contract, implement the concrete adapter in the constitutional infrastructure owner, then select it in bootstrap/container.

### Add SDUI behavior

Change generic structure/validation only in `sdui/ui-sdk`; change draft/publish/version/runtime-registry lifecycle in `sdui/registry`; keep product business policy in its bounded context.

## Common failure modes

Treat the following as architecture regressions, not convenient shortcuts:

- adding business use cases or repositories under `apps/api`;
- direct Prisma business queries from routes/controllers;
- reintroducing `src/context` or another request-context authority;
- importing Partner transport internals from Customer/Admin or vice versa;
- deep cross-domain imports instead of public contracts;
- leaking raw Prisma/provider/framework errors to clients;
- hiding provider failures in silent catches;
- logging request bodies, tokens, secrets or sensitive PII;
- putting CarBroz-specific business rules into generic SDUI infrastructure;
- changing tests to preserve deleted compatibility architecture.

## Validation

Use the repository scripts and CI workflow as the executable source of truth. For API/CW2 changes, the relevant commands are:

```bash
# API TypeScript build
pnpm --filter @carbroz/api build

# Architecture policy checks
pnpm exec vitest run tests/architecture

# API/operations integration boundary touched by the current CW2 repair
pnpm exec vitest run tests/integration/application/tracking-notification-engine.test.ts

# Final runtime sweep used by the canonical normal test suite
pnpm exec vitest run tests/unit/final-production-runtime.behavior.test.ts

# Repository-wide gates used by normal CI
pnpm prisma validate
pnpm prisma generate
pnpm build
pnpm lint
pnpm test -- --run
```

Canonical CI additionally applies the repository PostgreSQL migrations before build/test. Do not declare CW2 complete from README presence, a targeted test, or a historical green run alone; the resulting branch SHA must pass the required executable gates.
