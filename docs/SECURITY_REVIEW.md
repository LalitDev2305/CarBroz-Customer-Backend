# Enterprise Security Review & Audit

Security architecture and protection measures implemented across `apps/backend-api` and core domain packages.

## 1. Authentication & JWT Validation

- **Token Signing**: Standard RSA256 / HS256 JWT tokens with strict expiration and refresh token rotation.
- **Header Propagation**: Auth token carried via Standard `Authorization: Bearer <token>` HTTP header.

---

## 2. Authorization & RBAC

- **Role-Based Access Control**: `rbac.middleware.ts` verifies user roles (`CUSTOMER`, `PARTNER`, `ADMIN`) against required route permissions.
- **Resource Ownership Guard**: Domain use cases verify resource ownership before allowing mutations (e.g. customer profile edits, booking cancellations).

---

## 3. Data Sanitization & Input Guarding

- **Schema Validation**: Fastify / Zod schema validation on incoming JSON payloads to prevent injection attacks.
- **Error Shielding**: Production error handler sanitizes stack traces and returns generic error responses (`500 Internal Server Error`) with unique correlation IDs for backend log correlation.
