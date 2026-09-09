# Phase 4 — Redis OTP Repository Contract

> **Status:** FROZEN IMPLEMENTATION CONTRACT — higher-authority dependency-boundary correction applied after the first Phase 4 Constitution run.
>
> **Authority:** `docs/MASTER-BACKEND-CONSTITUTION.md`, `docs/PRODUCTION_FREEZE_CONSTITUTION.md`, `docs/PARTNER-AUTH-SDUI-REDIS-IMPLEMENTATION-PLAN.md`, and `domains/identity/README.md` remain higher-level authorities. If this document conflicts with a Constitution gate, the Constitution wins and this document is corrected before implementation continues.
>
> **Scope:** Replace development/production runtime persistence behind the existing Identity-owned `IOtpChallengeRepository` with Redis while preserving existing Send OTP / Verify OTP business semantics. This phase does **not** change Login SDUI request mapping, Send OTP destination output, OTP screen composition, Verify OTP destination output, Dashboard routing, or Prisma schema retirement.

---

## 1. Phase 4 objectives

Phase 4 must deliver all of the following:

1. keep `IOtpChallengeRepository` as the single Identity persistence port;
2. add one technical Redis adapter, `RedisOtpChallengeRepository`, outside `domains/*` because the Backend Constitution forbids domains from importing platform packages;
3. place the adapter under `platform/integrations`, the canonical workspace for technical adapters that implement inward-facing domain ports;
4. reuse the single Redis technical client owned by the API composition root;
5. preserve opaque public challenge IDs and the existing numeric internal repository ID contract;
6. persist only OTP hashes, never plaintext OTP values;
7. preserve latest-challenge lookup, verification lookup, rate-window counting, failed attempts, invalidation and exactly-once consumption;
8. make Redis state transitions atomic where repository semantics require them;
9. enforce a race-safe create/rate-limit guard in Redis so concurrent sends cannot bypass the configured challenge limit;
10. switch development/production DI to Redis only after adapter parity tests are present;
11. retain Prisma OTP persistence only as deterministic test/legacy infrastructure until the later explicit retirement phase;
12. fail closed on Redis failure with no runtime Redis → memory or Redis → Prisma fallback;
13. complete full repository build/lint/Vitest/architecture/security re-verification before Phase 4 is marked complete.

---

## 2. Ownership and dependency direction

The corrected dependency direction is frozen as:

```text
Identity domain/application
  SendOtpUseCase / VerifyOtpUseCase
             ↓
  IOtpChallengeRepository                  # Identity-owned inward-facing port
             ↑
platform/integrations
  RedisOtpChallengeRepository              # technical adapter implementing the Identity port
             ↓
  IRedisClient                             # platform/cache domain-neutral technical Redis port
             ↓
apps/api composition root
  one concrete ioredis client singleton
```

This correction is mandatory because Constitution §§33–36 forbid every `domains/*` source file — including a domain's infrastructure directory — from importing a `@carbroz/platform-*` implementation package. The adapter therefore cannot physically live in `domains/identity/infrastructure` if it needs `IRedisClient`.

Ownership rules:

- `domains/identity` owns OTP business policy, `OtpChallenge`, and `IOtpChallengeRepository` semantics.
- `platform/integrations` owns the concrete Redis OTP technical adapter, Identity-specific Redis keys/serialization and atomic Redis scripts.
- `platform/cache` owns only the domain-neutral Redis technical client/cache contracts and generic cache behavior.
- `apps/api` owns `REDIS_URL`, concrete `ioredis` construction/vendor options, singleton DI composition, startup/shutdown and readiness.
- The Identity public boundary exports the port/domain policy, never the concrete Redis adapter.
- No Identity source imports `@carbroz/platform-cache`, `ioredis`, environment variables or Fastify.
- No second Redis connection manager, cache abstraction or per-request Redis client may be created.

---

## 3. Existing repository semantics that must be preserved

The canonical `IOtpChallengeRepository` behavior remains authoritative:

```text
create(input)
tryCreateWithinRateLimit(input, guard)
findForVerification(publicId, phoneNumber, deviceId)
findLatestByPhone(phoneNumber)
countCreatedSince(phoneNumber, since)
recordFailedAttempt(id, maxAttempts)
tryConsume(id, now, maxAttempts)
invalidate(id, now)
```

`tryCreateWithinRateLimit()` is the smallest Phase 4 extension required to make the already-frozen concurrent rate-limit invariant enforceable at persistence commit time. It does not create a second repository abstraction.

The existing `OtpChallenge` shape remains:

```text
id                 numeric internal persistence identity
publicId           opaque client-safe challenge identity
phoneNumber
deviceId
otpHash              one-way hash only
attemptCount
maxAttempts
expiresAt
consumedAt
invalidatedAt
createdAt
updatedAt
```

---

## 4. Redis key ownership and versioning

All OTP keys implement Identity persistence semantics but are physically owned by the technical adapter. Key construction must be centralized inside that adapter.

Canonical namespace:

```text
carbroz:identity:otp:v1:
```

Required logical keys:

```text
carbroz:identity:otp:v1:seq
carbroz:identity:otp:v1:challenge:<internalId>
carbroz:identity:otp:v1:public:<publicId>
carbroz:identity:otp:v1:phone:<encodedPhone>:latest
carbroz:identity:otp:v1:rate:<encodedPhone>
```

Rules:

- phone-derived key material is deterministically encoded by one helper;
- raw OTP values never appear in a key or value;
- `publicId` remains opaque/non-sequential;
- numeric `id` remains internal and is allocated atomically in Redis;
- key-format changes require a namespace version change or explicit migration.

---

## 5. Stored challenge record

The Redis challenge value contains only state needed to reconstruct `OtpChallenge`:

```text
id
publicId
phoneNumber
deviceId
otpHash
attemptCount
maxAttempts
expiresAt
consumedAt
invalidatedAt
createdAt
updatedAt
```

Serialization rules:

- dates are ISO-8601 UTC strings and reconstructed as `Date` on read;
- malformed/corrupt JSON fails closed;
- OTP plaintext is never serialized;
- no provider payload, token, request body or unrelated PII is stored with the challenge.

---

## 6. TTL and retention policy

Challenge/public/latest TTL derives from the challenge's real `expiresAt` and must be positive.

Required behavior:

- challenge records automatically expire after verification usefulness ends;
- public-ID and latest-by-phone indexes cannot outlive their challenge;
- rate-window state has independent bounded retention derived from the application-owned rate window;
- consumed/invalidated records remain only until normal challenge expiry so replay/terminal-state checks stay deterministic within the challenge lifetime;
- no permanent OTP records are introduced.

---

## 7. Rate-limit and create atomicity

`SendOtpUseCase` may keep its existing cooldown/rate pre-checks for fast failure, but the final persistence decision must be atomic.

`tryCreateWithinRateLimit()` must atomically:

1. remove stale rate-window entries;
2. count current entries;
3. reject if the configured maximum is already reached;
4. allocate numeric internal ID;
5. create the challenge record;
6. create public-ID and latest-by-phone indexes;
7. add the rate-window member;
8. apply bounded TTLs.

If creation is rejected at commit time, the use case preserves `429 / OTP_RATE_LIMITED`.

No distributed lock is authorized; one Redis atomic script/transaction protects this invariant.

---

## 8. Atomic state transitions

### Failed attempt

`recordFailedAttempt(id, maxAttempts)` atomically rejects missing/consumed/invalidated/max-attempt challenges, increments once, updates `updatedAt`, preserves record TTL and returns the updated challenge.

### Consume

`tryConsume(id, now, maxAttempts)` atomically succeeds only when the challenge exists, is active, unexpired and below max attempts. Exactly one concurrent verification can transition `consumedAt`; replay/competitors return false.

### Invalidate

`invalidate(id, now)` atomically sets `invalidatedAt` only while active. Repeated invalidation is idempotent. Invalidated challenges no longer count toward the existing `countCreatedSince()` semantics, matching the Prisma adapter's `invalidatedAt: null` filter.

Redis Lua JSON-null handling must use Redis `cjson.null`; comparing decoded JSON null fields with Lua `nil` is incorrect.

---

## 9. Redis technical surface

`IRedisClient` remains one domain-neutral technical Redis port. Phase 4 may extend it only with generic primitives needed by technical adapters:

```text
zcount(...)
eval(...)
```

No OTP-specific method names belong in `IRedisClient`.

The concrete `ioredis` client is created exactly once by `apps/api`. `RedisCacheProvider` and `RedisOtpChallengeRepository` share that same `redisClient` singleton in development/production.

---

## 10. Runtime DI migration

Before Phase 4:

```text
otpChallengeRepository -> PrismaOtpChallengeRepository
```

After Phase 4:

```text
NODE_ENV=test
  otpChallengeRepository -> PrismaOtpChallengeRepository

development / production
  otpChallengeRepository -> platform/integrations RedisOtpChallengeRepository
```

Rules:

- no dual write;
- no runtime fallback to Prisma or memory;
- one repository implementation is selected for a runtime;
- Redis adapter and cache provider share one root `redisClient` singleton;
- existing Prisma adapter/table stay untouched until Phase 11 explicitly retires them.

---

## 11. Failure semantics

Redis infrastructure failures propagate and OTP auth fails closed. Create/read/mutation failures are never fabricated as successful/missing state merely to continue. Rate-limit rejection is a business result, not an infrastructure outage, and preserves `OTP_RATE_LIMITED / 429`. Client-facing mapping remains owned by the Phase 2 global error contract. OTP values and Redis credentials are never logged.

---

## 12. Required Phase 4 tests

Focused adapter tests must prove:

- create/read round trip;
- opaque public-ID + phone/device binding;
- latest-by-phone lookup;
- rate-window count;
- atomic create maximum and concurrent create safety;
- positive challenge/index TTLs;
- missing/expired index behavior;
- corrupt serialization fails closed;
- failed attempts are atomic/bounded;
- invalidation is idempotent/terminal and removed from active rate count;
- exactly one concurrent consume succeeds;
- consume rejects expired/invalidated/consumed/max-attempt challenges;
- no plaintext OTP persistence;
- exact `carbroz:identity:otp:v1:` namespace;
- Redis failures propagate without fallback.

DI/boundary tests must prove:

- domain source has no platform import;
- development/production selects Redis adapter;
- test composition remains deterministic on Prisma;
- cache + OTP adapter share one `redisClient` singleton;
- no per-request/second Redis client exists;
- concrete adapter is not exported through the Identity public boundary.

Repository-wide closeout must pass all Constitution/CW gates, Prisma checks, build, ESLint, full Vitest, repeated gates and non-mutating/read-only proof.

---

## 13. Explicitly out of scope

Phase 4 does not implement Partner Login request correction (Phase 5), canonical Send OTP destination (Phase 6), OTP screen (Phase 8), Verify OTP destination migration (Phase 9), Dashboard routing (Phase 10), Prisma OTP table/adapter deletion (Phase 11), frontend changes, a second Redis/cache abstraction, distributed locks, or another response/error framework.

---

## 14. Phase 4 definition of done

Phase 4 is complete only when:

1. this contract matches all higher-authority architecture rules;
2. `RedisOtpChallengeRepository` implements the Identity-owned port from `platform/integrations` without a domain → platform dependency;
3. atomic create/rate-limit, failed-attempt, consume and invalidate semantics are proven;
4. dev/prod DI uses Redis while test remains deterministic;
5. cache and OTP adapter share one technical Redis singleton;
6. no dual write/fallback exists;
7. focused adapter/DI/boundary tests pass;
8. owner docs match implementation;
9. full canonical CI/closeout is green on the documentation-complete HEAD;
10. Phase 5 remains untouched.

### Phase 4 verification note

The first lock-synchronized Phase 4 CI correctly rejected the initial physical adapter placement because `domains/identity/infrastructure/RedisOtpChallengeRepository` imported `@carbroz/platform-cache`. This was a documentation/placement defect against the higher-authority Constitution, not a reason to weaken the gate. The corrected contract above moves the technical adapter to `platform/integrations` while preserving Identity ownership of the port and all previously frozen runtime semantics.
