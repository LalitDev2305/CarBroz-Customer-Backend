---
Version: 1.0.0
Status: FROZEN
Owner: CarBroz Architecture Team
Last Updated: 2026-08-02
---

# 08 Security Standards

## Authentication
- **JWT**: Short-lived, stateless access tokens.
- **Refresh Tokens**: Opaque, stateful tokens mapped to `UserSession`. Require rotation and device mapping.

## Authorization & Access Control
- **RBAC**: Strict role-based access control. Endpoints default to `DENY` unless explicitly granted.
- **MFA**: Required for all destructive Admin mutations.

## Data Protection
- **Encryption**: AES-256 for PII in the database.
- **Secrets**: Passwords, salts, and provider keys MUST be retrieved from environment variables or a secrets manager (e.g., Vault). NEVER hardcode secrets.

## Edge & Webhook Security
- **Rate Limiting**: Tier-based IP and UserID limiting.
- **Webhook Verification**: HMAC signature verification required for all third-party incoming webhooks (e.g., Razorpay, Twilio).

## Auditing
- **Audit Logs**: All state mutations by partners or admins must append an immutable record to the Audit Log database.
