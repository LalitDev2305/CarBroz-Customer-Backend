# CarBroz Backend Testing, Extensibility and Provider Standard

> **Authority:** This document is subordinate to `docs/MASTER-BACKEND-CONSTITUTION.md` and operationalizes its testing, dependency-inversion and architecture-freeze requirements.

## Core law: optimize for change blast radius

For every design, ask:

> If this requirement changes tomorrow, how many unrelated files/modules must change?

Internal implementation changes should remain internal. New SDUI vocabulary should be additive. External vendor replacement should occur behind a stable port/provider contract and composition root.

## Mandatory test behavior

Important rules require both positive and negative evidence.

Examples:

```text
valid input                  -> PASS
invalid input                -> FAIL
supported transition         -> PASS
unsupported transition       -> FAIL
known definition             -> PASS
unknown definition           -> FAIL
authorized access            -> PASS
unauthorized access          -> FAIL
first idempotent request     -> PASS
duplicate equivalent request -> same safe result / no duplicate side effect
```

A test suite consisting only of happy paths is incomplete.

## Required test layers

Use the smallest meaningful layer and add broader tests where boundaries matter:

- unit tests;
- domain invariant/state-machine tests;
- application/use-case tests;
- provider/port contract tests;
- repository contract tests;
- real PostgreSQL/Prisma integration tests;
- transaction/rollback/concurrency/idempotency tests;
- HTTP/auth/authz tests;
- SDUI contract/definition/factory/builder/validator/serializer/version tests;
- architecture/dependency-boundary tests;
- critical end-to-end tests.

Regression rule: every fixed production defect should receive a test that fails before the fix and passes after it, where technically practical.

## SDUI Open/Closed rule

Adding a new Template, Component, Section, Group or Element should normally require only:

1. implementing/declaring the new reusable definition;
2. registering it in the appropriate definition registry/bootstrap;
3. adding its tests.

Existing unrelated definitions, factories, builders, serializers and consumers should not require modification.

Canonical structural paths remain:

```text
Template -> Component -> Element
Template -> Component -> Section -> Element
Template -> Component -> Section -> Group -> Element
```

Component and Element are mandatory structural levels; Section and Group are optional.

Tests must prove legal paths pass and illegal/skipped/mixed branches fail.

## Provider replacement rule

Business/application code depends on capabilities, not vendors. Vendor-specific SDKs and response formats belong in adapters.

Examples of replaceable capabilities include, when present:

- payment gateway;
- maps/geocoding/distance;
- SMS;
- email;
- push notification;
- object storage;
- analytics/telemetry export;
- cache;
- queue/event transport;
- feature flag service.

The stable port owns canonical input/output/error semantics. Adapters translate vendor behavior to that contract.

Example dependency direction:

```text
Financials application -> PaymentGatewayPort <- RazorpayAdapter
                                          <- StripeAdapter
```

Changing the active provider should primarily require a new adapter plus composition/configuration change, not edits across Booking, Customer, Partner or unrelated domains.

## Provider contract tests

Where multiple adapters can implement the same capability, create a reusable contract suite. Every production adapter must satisfy the same behavior contract.

A payment contract, for example, should verify applicable behavior such as:

- canonical payment creation result;
- verification;
- refund semantics;
- provider error normalization;
- timeout/failure mapping;
- idempotency behavior;
- malformed-provider-response handling;
- no leakage of vendor-specific models into domain/application contracts.

Apply the same concept to maps, SMS, push, storage, cache and other replaceable providers where meaningful.

## Failure and resilience tests

Test important failure modes explicitly, including where applicable:

- provider timeout/unavailability;
- malformed external response;
- retry behavior;
- duplicate webhook/message delivery;
- transaction rollback;
- concurrent modification;
- duplicate request/idempotency collision;
- cache outage;
- queue outage;
- storage failure;
- partial external failure.

Retries must not create duplicate business effects. Duplicate payment webhooks must not create duplicate financial entries.

## Architecture regression tests

Automated checks must protect at least:

```text
domain -> infrastructure        forbidden
domain -> apps                  forbidden
foundation -> business domains  forbidden
ui-sdk -> CarBroz domains       forbidden
ui-sdk -> sdui-registry         forbidden
sdui-registry -> ui-sdk         allowed
cross-domain deep/internal import forbidden
Partner surface -> Customer internals forbidden
Customer surface -> Partner internals forbidden
API-owned business use cases    forbidden in final V3
platform-owned business rules   forbidden
legacy common/shared/packages   forbidden in final V3
circular dependencies           forbidden
```

During migration, explicitly known legacy paths may remain only as a shrinking transitional set. New code must not depend on them.

## Definition of Done

A change is not complete merely because it compiles. Depending on scope, it must demonstrate:

- correct successful behavior;
- correct rejection/failure behavior;
- preserved invariants;
- stable dependency direction;
- isolation from unrelated modules;
- appropriate documentation;
- regression coverage;
- extension/replacement behavior where the component is intentionally extensible;
- no newly introduced architecture violation or cycle.
