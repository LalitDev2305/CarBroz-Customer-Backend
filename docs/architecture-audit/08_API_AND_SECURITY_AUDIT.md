# 08 — API and Security Audit

---

## 1. REST & API Design Audit

- **Standardized Response Envelope**: Uniform `{ success, data, message, code, traceId }` across all endpoints via `ResponseHelper`.
- **Validation**: Strict Zod request body & parameter validation prior to use case execution.
- **Node Ownership Enforcement**:
  - `POST /components` -> forces `nodeLevel: COMPONENT`
  - `POST /subcomponents` -> forces `nodeLevel: SUBCOMPONENT`
  - `POST /children` -> forces `nodeLevel: CHILD`
  - `POST /children-data` -> forces `nodeLevel: CHILDREN_DATA`
  - Public payloads strictly forbid client `nodeLevel` manipulation.

## 2. Security & Auth Architecture
- **Authentication**: JWT token verification via Fastify plugin.
- **RBAC Enforcement**: Admin endpoints protected by `isAdmin` check in use cases and middleware.
- **Optimistic Locking**: Lock version check on draft update prevents overwrite race conditions.
