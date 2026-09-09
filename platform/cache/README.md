# Cache Platform (`platform/cache/`)

`platform/cache` owns cache-provider abstractions and the backend's canonical technical cache/Redis infrastructure. It does **not** own domain state transitions, authentication policy, OTP business rules, Partner behavior or product-specific cache policy.

## Canonical ownership

This package owns technical concerns such as:

- cache/Redis provider abstraction implementation;
- Redis client creation and connection lifecycle;
- connection reuse/pooling behavior supported by the chosen client;
- Redis endpoint/TLS/auth configuration mapping from application runtime configuration;
- connect/disconnect behavior;
- health/readiness integration where the platform architecture requires it;
- generic cache operations exposed through the existing platform abstraction;
- production-safe technical errors and observability hooks.

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

The Identity adapter may own OTP-specific Redis key generation/serialization because those keys implement an Identity persistence contract. `platform/cache` must remain product/domain-neutral.

## Reuse-before-create rule

Before adding Redis code:

1. search the repository for an existing Redis client/provider/connection manager;
2. inspect existing workspace dependencies and runtime configuration;
3. extend the canonical abstraction/provider when possible;
4. create a new Redis implementation only when no existing canonical equivalent exists.

There must be one backend Redis connection/provider mechanism, not one per domain.

## Failure and lifecycle policy

- Redis connections are long-lived infrastructure dependencies, not created per request.
- Authentication flows fail closed when required Redis operations are unavailable.
- No silent production fallback to `InMemoryCacheProvider` is allowed for OTP security state.
- Redis credentials and connection strings must never enter domain/application code.
- Logging must not expose secrets, OTP values or sensitive key payloads.
- Tests must cover connection/provider failure behavior in addition to normal operations.

## Current Partner authentication migration

The canonical implementation plan for the approved Redis-backed Partner Login → OTP flow is:

`docs/PARTNER-AUTH-SDUI-REDIS-IMPLEMENTATION-PLAN.md`.

That plan controls ordering: documentation → global response/error contract → Redis platform infrastructure → Redis Identity OTP adapter → Login request alignment → canonical destination result → OTP SDUI → Verify OTP alignment → full regression.
