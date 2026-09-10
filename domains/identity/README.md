# Identity Domain (`domains/identity/`)

> **Status:** ACTIVE  
> **Package:** `@carbroz/domain-identity`

Identity owns authentication/business security semantics. It does not own HTTP/Fastify transport, SDUI composition, Redis client construction, environment configuration, or frontend state.

## 1. Login and OTP ownership

Identity owns:

- user identity lookup/creation;
- role/session semantics;
- OTP generation policy;
- OTP hashing/verification;
- challenge expiry and resend/rate-limit policy;
- maximum verification attempts;
- device binding;
- challenge invalidation;
- one-time consumption/replay prevention;
- refresh-token issuance, hashing, rotation and revocation;
- authentication/security ports;
- transport-neutral next-destination values returned by auth use cases where required.

Identity application/domain code must remain transport- and infrastructure-neutral. It must not import Fastify request/reply types, Redis vendor clients, platform implementation packages, environment variables or SDUI builders/validators.

## 2. Partner auth flow

The currently frozen external flow is:

```text
Bootstrap
-> Partner Login SDUI
-> Send OTP
-> Partner OTP SDUI
-> Verify OTP
-> authenticated Dashboard destination
```

Presentation ownership:

```text
sdui/engine/src/screens/partner/PartnerLoginScreen.ts
sdui/engine/src/screens/partner/PartnerOtpScreen.ts
```

HTTP adaptation belongs under `apps/api/src/surfaces/partner` and the shared auth transport boundary. API controllers/routes must call Identity use cases and the SDUI engine; they must not recreate Identity business rules or screen composition.

## 3. Send OTP destination contract

Successful Send OTP returns the transport-neutral destination for the frozen OTP screen:

```text
screenId       = partner_otp
templateId     = tpl_partner_otp_v1
templateType   = form_template
endpoint       = /api/v1/partner/screen/auth_otp
method         = GET
authentication = NONE
```

Identity owns this application result value because it is part of the auth workflow result, but Identity does not validate it through SDUI implementation classes. The API/SDUI boundary is responsible for presentation-level validation and delivery.

## 4. OTP persistence dependency direction

Canonical abstraction:

```text
Identity SendOtpUseCase / VerifyOtpUseCase
        -> IOtpChallengeRepository       // Identity-owned port
        <- RedisOtpChallengeRepository   // platform/integrations adapter
        -> IRedisClient                  // platform/cache technical port
        -> one Redis client composed by apps/api
```

Production/development OTP challenge state is Redis-backed. Redis failures fail closed; there is no Redis -> Prisma or Redis -> process-memory production fallback and no dual write.

Tests may use deterministic fakes/test adapters to isolate application behavior, but those are test mechanisms and must not become a second production persistence authority.

The Redis adapter preserves:

- opaque public challenge IDs;
- internal repository IDs;
- phone/device-bound verification lookup;
- latest-by-phone lookup;
- atomic rate-limit enforcement;
- bounded failed attempts;
- active-only idempotent invalidation;
- single-winner consumption;
- expiry/consumed/invalidated/max-attempt rejection.

Only the OTP hash is persisted. Plaintext OTP values must never be persisted or logged.

## 5. Security implementation

`NodeAuthSecurityProvider` supplies Node-backed cryptographic primitives behind the Identity-owned security port:

- cryptographically generated OTP digits with allowed length validation;
- salted scrypt secret hashing;
- timing-safe verification;
- opaque refresh token generation;
- SHA-256 refresh-token hashing;
- random token-family identifiers.

Invalid encoded hashes fail verification rather than bypassing validation. Security errors and provider failures must not leak secrets.

## 6. SDUI boundary

Identity does **not** import `@carbroz/sdui-engine` merely to reuse screen schemas or builders.

Permanent ownership is:

```text
Identity
  -> authentication/business policy

sdui/engine
  -> Login / OTP presentation, generic actions, definitions, validation

apps/api
  -> HTTP/auth adaptation + dependency composition

platform/integrations
  -> concrete Redis/provider adapters behind Identity ports
```

The retired `ui-sdk` must not return. Partner API screen wrappers must not return.

## 7. Focused freeze tests

The current Configuration/Login/OTP/SDUI freeze must prove at least:

- valid and invalid OTP generation lengths;
- secret hash/verify success and malformed-hash rejection;
- Send OTP success, cooldown/rate limit and provider failure behavior;
- only OTP hash is persisted;
- OTP public challenge + device/phone binding;
- verification invalid/expired/consumed/max-attempt cases;
- exactly-once successful consume/replay rejection;
- Redis atomic create/rate limiting;
- Redis failed-attempt/invalidation/consume behavior;
- Redis corruption/provider failure propagation without fallback;
- Login/session/role behavior used by the Partner auth flow;
- refresh/logout behavior where the same auth infrastructure is touched;
- architecture checks proving Identity has no Fastify/SDUI/platform-implementation dependency.

Detailed historical phase contracts may remain under `domains/identity/` as evidence of how these invariants were introduced. They do not override this current ownership model or the current Partner Auth/SDUI contract.

## 8. Engineering rules

- one Identity authentication implementation;
- one OTP persistence port;
- no plaintext OTP persistence/logging;
- no production Redis fallback or dual write;
- no SDUI composition in Identity;
- no provider/vendor client in Identity application/domain code;
- no Fastify request/reply leakage into Identity use cases;
- no duplicate destination contract that requires Identity to import SDUI implementation code;
- concurrency/replay/security failure paths must be tested;
- all focused changes must pass build, lint, Identity/OTP tests and architecture gates on the exact candidate SHA.
