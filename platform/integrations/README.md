# Integrations Platform (`platform/integrations/`)

Owns technical adapters for external providers and infrastructure-backed implementations of inward-facing domain ports. Domain/application policy remains in the owning bounded context; this workspace contains only technical integration details that must depend inward on those ports.

## Canonical responsibilities

Examples include:

- maps providers;
- payment providers;
- notification / OTP-delivery providers;
- external email/push/SMS adapters;
- Phase 4 Redis persistence adapter implementing Identity's `IOtpChallengeRepository`.

This placement follows the Backend Constitution: `domains/*` cannot import `@carbroz/platform-*`, so a Redis-backed repository implementation that needs the domain-neutral `IRedisClient` cannot live physically under `domains/identity`. Identity continues to own `OtpChallenge`, OTP policy and `IOtpChallengeRepository`; `platform/integrations` owns only the technical Redis implementation of that port.

## Phase 4 Redis OTP adapter

Dependency direction:

```text
platform/integrations/RedisOtpChallengeRepository
        ├── depends inward on @carbroz/domain-identity public port/contracts
        └── depends on @carbroz/platform-cache IRedisClient
                       ↓
             shared concrete Redis client
                 created by apps/api
```

Rules:

- no OTP business policy moves into this workspace;
- OTP-specific Redis key/serialization/atomic-script mechanics belong to the adapter because they are persistence technology details implementing the Identity port;
- the adapter uses the versioned `carbroz:identity:otp:v1:` namespace;
- only OTP hashes are persisted;
- atomic create/rate-limit, failed-attempt, consume and invalidate mechanics preserve the Identity repository semantics;
- Redis errors propagate fail-closed;
- no Redis → Prisma/memory fallback or dual-write exists;
- the adapter reuses the same root `IRedisClient` singleton as `RedisCacheProvider` in development/production;
- concrete Redis construction, `REDIS_URL`, retry options and lifecycle remain owned by `apps/api`;
- no second Redis client/provider abstraction is authorized.

The detailed frozen Phase 4 contract is `domains/identity/PHASE-4-REDIS-OTP-CONTRACT.md`.
