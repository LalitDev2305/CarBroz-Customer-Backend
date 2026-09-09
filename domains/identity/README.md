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

Phase 4 implements Redis as the development/production runtime persistence for OTP challenge state while preserving that Identity-owned port.

Dependency direction is:

```text
SendOtpUseCase / VerifyOtpUseCase
             ↓
IOtpChallengeRepository
             ↓
RedisOtpChallengeRepository          # Identity infrastructure
             ↓
IRedisClient                         # platform/cache technical port
             ↓
single Redis client supplied by apps/api
```

The Redis adapter preserves challenge creation, opaque public challenge IDs, numeric internal repository IDs, latest-by-phone lookup, verification lookup with phone/device binding, rate-window counting, bounded failed attempts, invalidation and exactly-once consumption. OTP plaintext is never persisted; only `otpHash` is stored.

The Redis key namespace is versioned and Identity-owned:

```text
carbroz:identity:otp:v1:seq
carbroz:identity:otp:v1:challenge:<internalId>
carbroz:identity:otp:v1:public:<publicId>
carbroz:identity:otp:v1:phone:<encodedPhone>:latest
carbroz:identity:otp:v1:rate:<encodedPhone>
```

Challenge/public/latest indexes use TTL derived from the actual challenge expiry. Rate-window state has independent bounded retention. Consumed/invalidated challenge records remain only until normal challenge expiry so replay/terminal-state checks remain deterministic within the challenge lifetime.

### Atomicity

The persistence boundary protects the repository invariants atomically:

- `tryCreateWithinRateLimit()` performs the final rate-window decision and challenge/index creation in one Redis atomic operation, preventing concurrent Send OTP calls from exceeding the configured maximum;
- `recordFailedAttempt()` increments once per successful mutation and stops at the maximum;
- `tryConsume()` is single-winner and rejects consumed, invalidated, expired or max-attempt challenges;
- `invalidate()` is active-only and idempotent;
- no distributed lock is used because the required invariants are protected by Redis-native atomic scripts.

`SendOtpUseCase` keeps its existing cooldown/pre-check behavior but the persistence-time `tryCreateWithinRateLimit()` result is authoritative for the final concurrent rate-limit decision. A rejected create preserves the existing `OTP_RATE_LIMITED` application result.

### Runtime selection

Runtime composition is intentionally transitional until the later explicit Prisma-retirement phase:

```text
NODE_ENV=test
  otpChallengeRepository -> PrismaOtpChallengeRepository

development / production
  otpChallengeRepository -> RedisOtpChallengeRepository
```

Tests remain deterministic. Development/production have no Redis → Prisma or Redis → memory fallback and no dual write. The Prisma adapter/table remain only for deterministic test/legacy compatibility until Phase 11 explicitly retires them.

`platform/cache` owns the domain-neutral Redis/cache provider behavior and `IRedisClient`. The executable `apps/api` composition root owns `REDIS_URL`, concrete `ioredis` construction/vendor options, the single `redisClient` singleton, Fastify lifecycle and readiness. `RedisCacheProvider` and `RedisOtpChallengeRepository` share that same technical Redis client singleton in development/production.

Do not call Redis directly from Identity use cases.

The detailed Phase 4 contract is:

```text
domains/identity/PHASE-4-REDIS-OTP-CONTRACT.md
```

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
- Redis failures fail closed; no silent in-memory/Prisma production fallback.
- No Prisma+Redis dual write.
- Concurrency/replay behavior must be covered by tests.
- Concrete infrastructure adapters are not exported through the Identity public boundary.
- Frontend MVI/UDF is a client concern; backend results must remain deterministic and reducer-friendly without introducing frontend state-machine classes here.

## Current execution authority

For the Partner Login → OTP → Verify OTP migration, the canonical phased implementation contract is:

`docs/PARTNER-AUTH-SDUI-REDIS-IMPLEMENTATION-PLAN.md`.

Phase 4 implementation is present and must pass the documentation-complete canonical repository closeout before being marked formally complete.
