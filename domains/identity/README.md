# Identity Domain (`domains/identity/`)

Identity owns user identities, sessions, authentication policy, OTP challenge semantics, roles and authorization permissions.

## Authentication ownership

Identity owns the business/application rules for:

- OTP generation policy;
- OTP hashing requirements;
- challenge expiry;
- resend cooldown;
- per-phone rate limiting;
- maximum verification attempts;
- challenge invalidation;
- one-time challenge consumption and replay prevention;
- device binding;
- user/session creation;
- refresh-token issuance, hashing, rotation and revocation;
- authentication provider ports.

Identity application/domain code MUST remain transport- and infrastructure-neutral. It must not import Fastify, Redis clients, Prisma clients, environment variables, HTTP DTOs or SDUI implementation classes.

## OTP persistence

The canonical OTP persistence abstraction remains:

```text
domains/identity/domain/repositories/IOtpChallengeRepository.ts
```

Redis is the approved target runtime persistence for OTP challenge state.

Dependency direction is frozen as:

```text
SendOtpUseCase / VerifyOtpUseCase
             ↓
IOtpChallengeRepository
             ↓
Identity infrastructure adapter
             ↓
platform/cache Redis infrastructure
             ↓
Redis client supplied by apps/api
```

The Redis adapter must preserve the existing repository/business semantics: challenge creation, latest-by-phone lookup, rate-window counting, failed-attempt recording, atomic one-time consumption and invalidation.

`platform/cache` owns the domain-neutral Redis/cache provider behavior and the injected Redis client surface. The executable `apps/api` composition root owns `REDIS_URL`, concrete `ioredis` construction/vendor options, singleton DI registration, Fastify startup/shutdown orchestration and readiness integration. Redis key/serialization logic specific to OTP challenge persistence belongs to the Identity infrastructure adapter implementing `IOtpChallengeRepository`.

Do not call Redis directly from Identity use cases.

## SDUI/navigation boundary

Identity does not own SDUI structure. Authentication application results may expose transport-neutral next-destination metadata required by the caller, but Identity must not depend on `sdui/ui-sdk` merely to reuse a Zod schema.

The current legacy auth navigation result shape `{ template, api }` is scheduled to migrate to canonical destination semantics as defined in:

```text
docs/PARTNER-AUTH-SDUI-REDIS-IMPLEMENTATION-PLAN.md
```

The actual Partner Login/OTP screen compositions remain owned by the Partner API surface and the generic SDUI vocabulary remains owned by `sdui/ui-sdk`.

## Engineering rules

- Reuse existing Identity ports/use cases before creating abstractions.
- Keep one responsibility per class/module.
- Infrastructure implements Identity-owned ports.
- No duplicate authentication flow for Partner.
- No plaintext OTP persistence or logging.
- Redis failures fail closed; no silent in-memory production fallback.
- Concurrency/replay behavior must be covered by tests.
- Frontend MVI/UDF is a client concern; backend results must remain deterministic and reducer-friendly without introducing frontend state-machine classes here.

## Current execution authority

For the Partner Login → OTP → Verify OTP migration, the canonical phased implementation contract is:

`docs/PARTNER-AUTH-SDUI-REDIS-IMPLEMENTATION-PLAN.md`.
