# Cache Platform (`platform/cache/`)

`platform/cache` owns cache-provider abstractions and the backend's canonical technical cache/Redis infrastructure. It does **not** own domain state transitions, authentication policy, OTP business rules, Partner behavior or product-specific cache policy.

## Canonical ownership

This package owns technical concerns such as:

- cache/Redis provider abstraction implementation;
- Redis connection lifecycle through the canonical provider;
- connection reuse supported by the chosen client;
- Redis endpoint/TLS/auth configuration mapping from application runtime configuration;
- connect/disconnect behavior;
- health/readiness integration;
- generic cache operations exposed through the existing platform abstraction;
- production-safe technical failures.

It does not decide:

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
Redis client
```

The Identity adapter may own OTP-specific Redis key generation/serialization because those keys implement an Identity persistence contract. `platform/cache` remains product/domain-neutral.

## Phase 3 implementation

The canonical infrastructure is now:

```text
apps/api composition root
      ↓
createCacheProvider()
      ↓
RedisCacheProvider             # platform/cache
      ↓
IRedisClient                   # minimal technical client surface
      ↓
ioredis                       # existing API dependency
```

Key rules:

- `ICacheProvider` is the single generic cache contract.
- `RedisCacheProvider` is the canonical production/development provider.
- `InMemoryCacheProvider` remains deterministic test infrastructure only; there is no production fallback.
- Redis is connected lazily once at application startup and shut down through Fastify `onClose` lifecycle.
- readiness checks Redis with `PING` and marks the app unready on failure.
- provider keys are namespaced; the generic cache namespace is `carbroz:cache:`.
- `clear()` uses `SCAN` + `DEL` only for the provider namespace and MUST NOT call `FLUSHDB`/`FLUSHALL`, because Redis is shared with messaging and future domain adapters.
- generic values are JSON serialized at the platform boundary.
- TTL must be a positive integer when supplied.
- OTP-specific keys and atomic scripts do not belong here; they are Phase 4 Identity infrastructure concerns.

### Runtime configuration

The executable runtime already owns and validates:

```text
REDIS_URL
```

`apps/api` uses its existing `ioredis` dependency and supplies the concrete client to `platform/cache`. No second Redis library or package-level Redis wrapper is introduced.

Current client policy:

- lazy connection;
- ready check enabled;
- 5 second connection timeout;
- one retry per failed request;
- bounded reconnect backoff up to 2 seconds.

Production configuration validation continues to reject localhost Redis endpoints.

## Reuse-before-create rule

Before adding any new Redis capability:

1. search `platform/cache` for an existing operation/provider;
2. extend `ICacheProvider` only when the operation is genuinely domain-neutral;
3. keep domain-specific persistence semantics in the owning infrastructure adapter;
4. never instantiate Redis clients inside use cases/repositories per request;
5. never create another backend Redis connection/provider mechanism.

## Failure and lifecycle policy

- Redis connections are long-lived infrastructure dependencies, not created per request.
- Authentication flows fail closed when required Redis operations are unavailable.
- No silent production fallback to `InMemoryCacheProvider` is allowed for OTP security state.
- Redis credentials and connection strings never enter domain/application code.
- Logging must not expose secrets, OTP values or sensitive payloads.
- Tests cover lifecycle, health failure, serialization, TTL and namespace-safe clearing.

## Current Partner authentication migration

The canonical implementation plan for the approved Redis-backed Partner Login → OTP flow is:

`docs/PARTNER-AUTH-SDUI-REDIS-IMPLEMENTATION-PLAN.md`.

Phase 3 establishes only the Redis platform infrastructure. Phase 4 will implement the Identity-owned Redis OTP adapter behind the existing `IOtpChallengeRepository`; OTP business rules are intentionally unchanged in this phase.
