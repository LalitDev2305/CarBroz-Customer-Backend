# CarBroz SDUI Documentation Authority Map

> **Status:** ACTIVE INDEX — read this before changing SDUI code.

This file defines which SDUI documents are implementation authorities, which are compatibility/security contracts, and which are historical audit records.

## 1. Read order before implementation

Implementation must follow this order:

```text
1. SDUI-COMPOSE-CONTRACT-IMPLEMENTATION-PLAN.md
2. ui-sdk/ACTION-CONTRACT.md
3. PARTNER-AUTH-SDUI-CONTRACT.md        // when Partner Auth is involved
4. docs/PARTNER-AUTH-SDUI-MVI-UDF-HANDOFF.md
5. docs/PARTNER-AUTH-SDUI-REDIS-IMPLEMENTATION-PLAN.md
6. backend constitutions / freeze gates
```

If an older historical document describes a different authoring architecture, the current final architecture document wins for implementation design while the older document's already-frozen external behavior remains preserved.

---

## 2. Primary implementation authority

### `SDUI-COMPOSE-CONTRACT-IMPLEMENTATION-PLAN.md`

This is the **single source of truth for SDUI architecture and implementation order**.

It freezes:

- one `sdui/engine` presentation authority;
- Composite hierarchy;
- explicit `template/component/section/group/element` hierarchy methods;
- fluent dot-based property configuration;
- five property categories:
  - base/default;
  - style;
  - content/instance;
  - behavior;
  - metadata/semantic;
- automatic canonical defaults;
- instance-only overrides;
- strict node-specific capability/property contracts;
- `action.*` and `ref.*` authoring;
- `ScreenComposer` Strategy;
- explicit one-time screen registration;
- `SduiService` orchestration;
- validation and migration phases;
- Login as the Golden Reference before OTP.

No implementation may substitute an older returned-child-builder architecture for this contract.

---

## 3. Generic action/API interaction authority

### `ui-sdk/ACTION-CONTRACT.md`

This is the stable generic interaction/wire contract during migration.

Frozen vocabulary:

```text
request
navigate
present
dismiss
state
external_uri
sequence
```

Frozen references:

```text
$binding
$context
$response
$literal
```

New engine authoring uses:

```text
action.*
ref.*
```

The authoring syntax may improve; wire semantics must not drift without deliberate versioning.

---

## 4. Partner Auth behavior authority

### `PARTNER-AUTH-SDUI-CONTRACT.md`

Freezes:

```text
Bootstrap → Login → Send OTP → OTP → Verify OTP → Dashboard
```

including exact screen/template identities, endpoints, authentication modes, request references, responseMode behavior, SESSION semantics and Redis-only OTP persistence.

SDUI architecture migration must preserve these behaviors exactly.

---

## 5. Frontend runtime handoff

### `../docs/PARTNER-AUTH-SDUI-MVI-UDF-HANDOFF.md`

Defines:

- backend/frontend ownership;
- generic action execution;
- binding/context/response resolution;
- MVI/UDF interaction boundary;
- transient auth-flow state;
- destination verification;
- credential/error handling.

It does not prescribe backend Builder classes or frontend concrete class names.

---

## 6. OTP/security authority

### `../docs/PARTNER-AUTH-SDUI-REDIS-IMPLEMENTATION-PLAN.md`

Remains authoritative for OTP security and Redis persistence where not superseded by a later security constitution.

The SDUI refactor must not reintroduce Prisma/in-memory production OTP persistence or alter one-time consume/security ordering.

---

## 7. Compatibility package documents

### `ui-sdk/README.md`

`ui-sdk` is a migration compatibility source. It is not the final authoring architecture.

Older `SduiScreenBuilder` / `addStack*()` / returned typed child Builder guidance is superseded for new implementation by the engine contract.

### `registry/README.md`

Registry is a persisted screen-document lifecycle boundary where still required. It is not a second SDUI vocabulary, screen builder, property framework or validator authority.

---

## 8. Historical documents

The following documents are historical evidence and should not be rewritten merely to make old timelines appear current:

### `PHASE-5-PARTNER-LOGIN-REQUEST-CONTRACT.md`

Historical phase record whose request behavior remains frozen. It has been synchronized with the new Login Golden Reference migration requirement.

### `PHASE-A-SOURCE-RECONCILIATION.md`

Historical source-reconciliation/audit record. Use it to understand previous repository state and migration decisions, not as the current Builder API specification.

### `SDUI-FINAL-FORENSIC-AUDIT.md`

Historical forensic closeout evidence for the state it audited. Future engine migration requires a new final forensic closeout against the current architecture; do not treat the historical audit as proof that future changes are green.

Historical evidence should remain truthful to the repository state it audited.

---

## 9. Conflict-resolution rule

When documents appear to conflict:

```text
security/backend constitutions
        ↓
current SDUI final architecture contract
        ↓
current action + Partner Auth behavior contracts
        ↓
frontend handoff / compatibility package docs
        ↓
historical phase/audit records
```

A historical path/file location never overrides the current ownership model.

A current architecture document never silently overrides already-frozen external behavior/security; explicit contract/version changes are required for that.

---

## 10. Documentation-first change rule

For any future SDUI change:

```text
1. identify affected contract(s)
2. update/freeze documentation first
3. implement exactly against the documents
4. add/modify tests without weakening existing gates
5. prove wire/behavior parity where required
6. run canonical repository closeout
7. update forensic documentation with actual final evidence
```

Never implement an architectural change first and retrofit the documentation afterward.

---

## 11. Current next implementation step

The next implementation work is **not OTP**.

Follow the phases in `SDUI-COMPOSE-CONTRACT-IMPLEMENTATION-PLAN.md`:

```text
property model foundation
→ fluent property scopes
→ hierarchy DSL refinement
→ complete generic actions/ref authoring
→ screen registration simplification
→ migrate Partner Login as Golden Reference with deep parity proof
→ only then migrate Partner OTP
```

This order is frozen until the architecture document is deliberately reopened.
