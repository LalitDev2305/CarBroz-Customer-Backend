# Phase 4 — Redis OTP Repository Contract

> **Status:** FROZEN IMPLEMENTATION CONTRACT — implementation must follow this document before Phase 4 can be marked complete.
>
> **Authority:** `docs/MASTER-BACKEND-CONSTITUTION.md`, `docs/PRODUCTION_FREEZE_CONSTITUTION.md`, `docs/PARTNER-AUTH-SDUI-REDIS-IMPLEMENTATION-PLAN.md`, and `domains/identity/README.md` remain higher-level authorities.
>
> **Scope:** Replace the development/production runtime persistence implementation behind the existing Identity-owned `IOtpChallengeRepository` with Redis while preserving existing Send OTP / Verify OTP business semantics. This phase does **not** change Login SDUI request mapping, Send OTP destination output, OTP screen composition, Verify OTP destination output, Dashboard routing, or Prisma schema retirement.

---

## 1. Phase 4 objectives

Phase 4 must deliver all of the following in one coherent migration:

1. keep `IOtpChallengeRepository` as the single Identity persistence port;
2. add one Identity infrastructure adapter, `RedisOtpChallengeRepository`;
3. reuse the single Redis technical client owned by the API composition root;
4. preserve opaque public challenge IDs and the existing numeric internal repository ID contract;
5. persist only OTP hashes, never plaintext OTP values;
6. preserve latest-challenge lookup, verification lookup, rate-window counting, failed attempts, invalidation and exactly-once consumption;
7. make Redis state transitions atomic where repository semantics require them;
8. enforce a race-safe create/rate-limit guard in Redis so concurrent send requests cannot bypass the configured challenge limit;
9. switch development/production DI to Redis only after adapter parity tests are present;
10. retain Prisma OTP persistence only as deterministic test/legacy infrastructure until the later explicit retirement phase;
11. fail closed on Redis failure with no runtime Redis → memory or Redis → Prisma fallback;
12. complete full repository build/lint/Vitest/architecture/security re-verification before Phase 4 is marked complete.

---

## 2. Ownership and dependency direction

The dependency direction is frozen as:

```text
SendOtpUseCase / VerifyOtpUseCase
             ↓
IOtpChallengeRepository                  # Identity domain-owned port
             ↓
RedisOtpChallengeRepository              # Identity infrastructure adapter
             ↓
IRedisClient                             # platform/cache technical port
             ↓
single concrete ioredis client           # apps/api composition root
```

Ownership rules:

- Identity domain/application owns OTP policy and repository semantics.
- Identity infrastructure owns OTP-specific Redis keys, serialization and atomic scripts.
- `platform/cache` owns only domain-neutral Redis/cache technical contracts.
- `apps/api` owns `REDIS_URL`, concrete `ioredis` construction, connection/retry policy and runtime DI composition.
- No Identity use case may import `ioredis`, environment variables, Fastify, Prisma clients or cache-provider implementation classes.
- No second Redis connection manager, cache abstraction or per-request Redis client may be created.

---

## 3. Existing repository semantics that must be preserved

The canonical `IOtpChallengeRepository` behavior remains authoritative:

```text
create(input)
findForVerification(publicId, phoneNumber, deviceId)
findLatestByPhone(phoneNumber)
countCreatedSince(phoneNumber, since)
recordFailedAttempt(id, maxAttempts)
tryConsume(id, now, maxAttempts)
invalidate(id, now)
```

The existing `OtpChallenge` domain shape remains:

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

Phase 4 may **extend** the existing port only where required to preserve the already-frozen race-safety requirement. It must not replace the port or create a competing OTP repository abstraction.

---

## 4. Redis key ownership and versioning

All OTP keys are Identity-owned and versioned. The adapter must centralize key construction; call sites must not concatenate OTP Redis keys ad hoc.

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

- phone-derived key material must be deterministically encoded/sanitized by one helper;
- raw OTP values must never appear in a key or value;
- `publicId` remains opaque and non-sequential;
- the numeric `id` remains internal and is allocated through Redis atomically;
- key format changes require a namespace version change or explicit migration.

---

## 5. Stored challenge record

The challenge value must contain only repository/domain state needed to reconstruct `OtpChallenge`:

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

- dates are stored as ISO-8601 UTC strings;
- reads reconstruct real `Date` objects;
- malformed/corrupt challenge JSON fails closed rather than being silently accepted;
- OTP plaintext is never serialized;
- no provider response payload, token, request body or unrelated PII is stored with the challenge.

---

## 6. TTL and retention policy

Challenge/index TTL is derived from the challenge's actual `expiresAt` and must be positive when written.

Required behavior:

- challenge record expires automatically after its useful verification lifetime;
- public-ID index expires with the challenge;
- latest-by-phone index expires with the challenge and therefore cannot outlive the record it references;
- rate-window state has an independent sliding retention suitable for `AUTH_SECURITY_POLICY.otp.rateLimitWindowMs`;
- consumed/invalidated records remain available until normal challenge expiry so replay/terminal-state checks remain deterministic during the challenge lifetime;
- Phase 4 does not introduce permanent OTP Redis records.

---

## 7. Rate-limit and create atomicity

The existing Send OTP flow checks recent challenge count before creation. Redis persistence must additionally protect the create boundary against concurrent sends so two requests that both observe the same pre-create count cannot overrun the configured maximum.

The canonical solution is **reuse + extension**, not a new service:

- keep `IOtpChallengeRepository`;
- extend it with the smallest atomic create-with-limit capability needed by `SendOtpUseCase`;
- pass the application-owned rate-window boundary and maximum into the repository call;
- Redis performs stale rate-entry cleanup, count check, internal-ID allocation, challenge write, public index write, latest index write and rate-member insertion atomically;
- if the maximum has already been reached at commit time, the repository returns a non-created result and `SendOtpUseCase` preserves the existing `429 / OTP_RATE_LIMITED` application behavior.

No distributed lock is authorized because one Redis atomic script/transaction can protect this invariant.

The existing `countCreatedSince()` method remains available because it is part of the canonical port and useful for parity/diagnostics, but the final create decision must be made atomically at persistence time.

---

## 8. Atomic state transitions

The following operations must be race-safe and single-winner where required:

### Failed attempt

`recordFailedAttempt(id, maxAttempts)` must atomically:

1. load the challenge;
2. reject missing/consumed/invalidated challenges;
3. reject challenges already at or above `maxAttempts`;
4. increment `attemptCount` once;
5. update `updatedAt`;
6. persist and return the updated challenge.

Concurrent failed verifications must not lose increments.

### Consume

`tryConsume(id, now, maxAttempts)` must atomically succeed only when:

```text
challenge exists
consumedAt == null
invalidatedAt == null
expiresAt > now
attemptCount < maxAttempts
```

Exactly one concurrent valid verification may transition `consumedAt` from null to `now`. All competing consume attempts must return false.

### Invalidate

`invalidate(id, now)` must atomically set `invalidatedAt` only while the challenge is neither consumed nor already invalidated. Repeated invalidation is idempotent.

---

## 9. Redis technical surface

`IRedisClient` remains the one domain-neutral technical Redis port. Phase 4 may extend it only with the minimum generic Redis primitives needed by the Identity adapter, specifically atomic script execution and sorted-set counting required for rate-window semantics.

It must not gain OTP-specific method names.

The concrete `ioredis` client remains created once in `apps/api`. The existing generic `RedisCacheProvider` and the new Identity Redis adapter must share that same client singleton in development/production.

`NODE_ENV=test` remains deterministic and does not silently change development/production behavior. Prisma OTP persistence may remain the test composition until the later explicit retirement phase; Redis adapter behavior itself must be covered by focused deterministic tests using a controlled fake technical client/script harness.

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
  otpChallengeRepository -> RedisOtpChallengeRepository
```

Rules:

- no dual write;
- no runtime fallback to Prisma after Redis failure;
- no memory fallback;
- one repository implementation is selected for a runtime;
- Redis adapter registration must use the same root Redis client singleton as `RedisCacheProvider`;
- existing Prisma adapter/table remain untouched for now and are retired only in Phase 11 after production parity.

---

## 11. Failure semantics

Redis infrastructure failures propagate as failures and OTP auth fails closed.

Required behavior:

- create failure does not return a usable challenge;
- read failure does not silently return a fabricated challenge;
- failed-attempt/consume/invalidate failures are not ignored;
- no fallback to in-memory or Prisma is attempted in development/production;
- no OTP plaintext or Redis credentials are logged;
- client-facing mapping remains owned by the existing Phase 2 global error contract.

Rate-limit rejection is a business result, not an infrastructure outage, and must preserve `OTP_RATE_LIMITED` / HTTP 429 behavior.

---

## 12. Required Phase 4 tests

Focused adapter tests must prove:

- challenge create/read round trip;
- opaque public-ID lookup + phone/device binding;
- latest-by-phone lookup;
- rate-window count;
- atomic create rejects the request that would exceed max challenges;
- concurrent/competing create attempts cannot exceed the configured maximum;
- positive TTL applied to challenge and indexes;
- expired/missing index behavior fails closed;
- invalid/corrupt challenge serialization fails closed;
- failed-attempt increment is atomic and bounded;
- max-attempt state prevents further mutation;
- invalidation is idempotent and terminal;
- exactly one consume succeeds under concurrent attempts;
- consume rejects expired, invalidated, consumed or max-attempt challenges;
- no plaintext OTP is stored/logged;
- key namespace is exactly `carbroz:identity:otp:v1:`;
- Redis failures are propagated and do not trigger fallback.

DI tests must prove:

- development/production composition selects `RedisOtpChallengeRepository`;
- test composition remains deterministic;
- `RedisCacheProvider` and `RedisOtpChallengeRepository` share one Redis client singleton;
- no second Redis client is created per request.

Repository-wide closeout must then pass:

- architecture/Constitution gates;
- CW5 error/runtime-config/PII gates;
- Prisma validate/generate/migrations;
- monorepo build;
- ESLint;
- full Vitest;
- repeated post-test architecture/security gates;
- non-mutating/read-only verification proof.

---

## 13. Explicitly out of scope

Phase 4 must not implement:

- Partner Login request-body correction (Phase 5);
- canonical Send OTP destination result (Phase 6);
- Partner OTP SDUI screen/route (Phase 8);
- Verify OTP destination migration (Phase 9);
- authenticated Partner Dashboard destination (Phase 10);
- Prisma OTP table/adapter deletion (Phase 11);
- frontend changes;
- new Redis/cache abstraction;
- distributed locks;
- second response envelope/error mapper.

---

## 14. Phase 4 definition of done

Phase 4 is complete only when all are true:

1. this contract remains consistent with higher-authority documentation;
2. `RedisOtpChallengeRepository` implements the canonical Identity port;
3. create/rate-limit, failed-attempt, consume and invalidate operations satisfy the atomicity rules above;
4. development/production DI uses Redis and test composition remains deterministic;
5. Redis cache and Identity OTP adapter share one technical Redis client singleton;
6. no dual write/fallback is present;
7. focused Redis OTP and DI tests pass;
8. canonical owner documentation is updated to the implemented state;
9. full canonical CI/closeout is green on the documentation-complete HEAD;
10. Phase 5 remains untouched until Phase 4 is formally closed.
