# Cache Platform (`platform/cache/`)

`platform/cache` owns cache-provider abstractions and the backend's canonical technical cache/Redis infrastructure. It does **not** own domain state transitions, authentication policy, OTP business rules, Partner behavior or product-specific cache policy.

## Canonical ownership

This package owns technical concerns such as:

- the single generic cache contract;
- Redis-backed generic cache behavior;
- connection lifecycle through the injected Redis client;
- generic connect/disconnect/health behavior;
- namespaced generic cache operations;
- JSON serialization and generic TTL handling;
- production-safe technical failures.

The executable composition root (`apps/api`) owns:

- `REDIS_URL` and environment validation;
- creation/configuration of the concrete `ioredis` client;
- vendor-specific connection/retry policy;
- registration of the singleton cache provider in the application Awilix container;
- Fastify startup/shutdown lifecycle orchestration;
- readiness integration.

`platform/cache` does not decide:

- OTP TTL duration;
- resend cooldown;
- maximum OTP attempts;
- OTP rate-limit policy;
- OTP key business meaning;
- challenge validation/consumption policy;
- user/session behavior.

Those rules remain owned by `domains/identity`.

## Redis approval

Redis is approved as the target runtime persistence for Identity OTP challenge state.

The required dependency direction is:

```text
Identity use cases
      ↓
IOtpChallengeRepository        # Identity-owned port
      ↓
Redis OTP repository adapter   # Identity infrastructure
      ↓
platform/cache                 # canonical Redis technical infrastructure
      ↓
Redis client supplied by apps/api
```

The Identity adapter may own OTP-specific Redis key generation/serialization because those keys implement an Identity persistence contract. `platform/cache` remains product/domain-neutral.

## Phase 3 implementation

The implemented infrastructure is:

```text
apps/api composition root
      ↓
redis-cache.plugin.ts
      ├── idempotent singleton registration in canonical Awilix root
      ├── initialize at application startup
      └── shutdown through Fastify onClose
      ↓
createCacheProvider()
      ↓
RedisCacheProvider             # platform/cache
      ↓
IRedisClient                   # minimal technical client surface
      ↓
ioredis                       # existing apps/api dependency
```

### Generic cache contract

`ICacheProvider` is the single generic cache contract and exposes:

```text
initialize?()
shutdown?()
health?()
get()
set()
delete()
clear()
```

`RedisCacheProvider` is the canonical development/production implementation.
`InMemoryCacheProvider` is deterministic test infrastructure selected by the executable factory only when `NODE_ENV=test`; there is no development/production fallback to memory.

### Provider configuration boundary

`RedisCacheConfig` intentionally contains only provider behavior owned by `platform/cache`:

```text
keyPrefix?
defaultTtlSeconds?
```

Connection URL, credentials/TLS encoded in the URL, connection timeout and retry policy are **not** part of `RedisCacheConfig`; they belong to the executable/vendor-client composition boundary.

### Runtime Redis client policy

`apps/api/src/bootstrap/cache/create-cache-provider.ts` reuses the existing `ioredis` dependency and configures:

- `REDIS_URL` from canonical runtime configuration;
- lazy connection;
- ready check enabled;
- 5 second connection timeout;
- `maxRetriesPerRequest = 1`;
- reconnect delay capped at 2 seconds.

Production runtime validation continues to reject localhost Redis endpoints.

### Lifecycle and failure policy

`apps/api/src/bootstrap/plugins/redis-cache.plugin.ts` runs after `di-plugin`, idempotently registers `cacheProvider` as an Awilix singleton if it is not already registered, resolves that same singleton, calls `initialize()` during startup and calls `shutdown()` from Fastify `onClose`.

For Redis-backed environments:

- initialization connects a lazy/waiting client and requires a successful `PING`;
- failed initialization throws and therefore fails application startup closed;
- `health()` returns false when Redis cannot answer `PING`;
- graceful shutdown uses `QUIT` and falls back to forced disconnect if `QUIT` fails;
- no silent Redis-to-memory runtime fallback is allowed.

### Readiness

`/health/readiness` resolves the same `cacheProvider` through the request DI scope and evaluates `health()` with a 3-second readiness timeout. Redis failure marks the Redis check as `error` and makes readiness return the degraded/503 state.

In tests the same path resolves `InMemoryCacheProvider`, whose health is deterministic and true.

### Namespace and data safety

- generic provider keys use the `carbroz:cache:` namespace unless explicitly configured otherwise;
- values are JSON serialized/deserialized at the provider boundary;
- supplied/default TTL must be a positive integer;
- empty keys are rejected before issuing Redis commands;
- `clear()` uses `SCAN` + `DEL` only for keys inside the provider namespace;
- `FLUSHDB` and `FLUSHALL` are forbidden because Redis is shared with messaging and future domain-specific adapters;
- OTP-specific key namespaces, atomic scripts and state transitions do not belong in this package and are Phase 4 Identity-infrastructure concerns.

## Reuse-before-create rule

Before adding any new Redis capability:

1. search `platform/cache` for an existing operation/provider;
2. extend `ICacheProvider` only when the operation is genuinely domain-neutral;
3. keep domain-specific persistence semantics in the owning infrastructure adapter;
4. never instantiate Redis clients inside use cases/repositories per request;
5. never create another backend Redis connection/provider mechanism.

## Phase 3 verification matrix

| Requirement | Implementation / evidence |
| --- | --- |
| Single generic cache abstraction | `ICacheProvider` |
| No duplicate provider interface | `InMemoryCacheProvider` implements `ICacheProvider` |
| Vendor isolation | `IRedisClient`; concrete `ioredis` exists only at executable composition boundary |
| Singleton DI | `redis-cache.plugin.ts` registers `asFunction(createCacheProvider).singleton()` |
| Same root/request provider | DI regression test in `apps/api/src/bootstrap/container/index.test.ts` |
| Test-only memory provider | `createCacheProvider()` selects it only for `NODE_ENV=test` |
| Startup fail closed | `RedisCacheProvider.initialize()` health-verifies and throws on failure; unit tested |
| Graceful/forced shutdown | `quit()` with `disconnect(false)` fallback; unit tested |
| Readiness | `/health/readiness` checks cache health with 3-second timeout |
| Safe namespace clearing | `SCAN` + namespaced `DEL`; BullMQ/non-cache keys preserved in test |
| JSON + TTL behavior | `RedisCacheProvider` tests |
| Domain neutrality | no Identity/OTP imports or rules in `platform/cache` |
| Runtime config ownership | `apps/api` owns `REDIS_URL` and vendor retry/timeout options |

## Gate status

Phase 3 source/documentation parity is evaluated independently from the repository-wide production closeout sequence.

The first closeout run for Phase 3 reached and passed CW2 topology, CW1/CW2 constitution, CW3 dependency convergence, CW4 domain/application convergence and CW5 resource/public-ID checks, then stopped at the pre-existing **CW5 error-semantics/leakage gate**. Because that global error contract is Phase 2 work and Phase 2 was intentionally skipped before starting Phase 3, later workflow steps (runtime-config gate, Prisma, full build, lint, tests and re-verification) did not execute in that run.

This gate must **not** be weakened or bypassed. Phase 3 must not modify global HTTP error semantics merely to make an unrelated gate pass. Repository-wide closeout can become fully green only after the documented Phase 2 response/error reconciliation is completed, followed by a fresh full closeout run.

## Current Partner authentication migration

The canonical cross-phase implementation plan remains:

`docs/PARTNER-AUTH-SDUI-REDIS-IMPLEMENTATION-PLAN.md`.

Phase 3 establishes only the Redis platform infrastructure. Phase 4 will implement the Identity-owned Redis OTP adapter behind the existing `IOtpChallengeRepository`; OTP business rules remain intentionally unchanged in Phase 3.
