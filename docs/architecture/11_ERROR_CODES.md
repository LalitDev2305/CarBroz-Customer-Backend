---
Version: 1.0.0
Status: FROZEN
Owner: CarBroz Architecture Team
Last Updated: 2026-08-02
---

# 11 Error Codes

All APIs must return a standardized error response.

## Standard Error Code Format
Error codes must be string-based constants to allow frontends to map specific UI states.
Format: `DOMAIN_SPECIFIC_ERROR`

### Reserved Domains
- `AUTH_xxx`: (e.g., `AUTH_INVALID_OTP`, `AUTH_TOKEN_EXPIRED`)
- `BOOKING_xxx`: (e.g., `BOOKING_SLOT_UNAVAILABLE`, `BOOKING_ALREADY_CANCELLED`)
- `PAYMENT_xxx`: (e.g., `PAYMENT_INSUFFICIENT_FUNDS`, `PAYMENT_GATEWAY_TIMEOUT`)
- `PARTNER_xxx`: (e.g., `PARTNER_NOT_FOUND`, `PARTNER_OFFLINE`)
- `ADMIN_xxx`: (e.g., `ADMIN_UNAUTHORIZED`)
- `CONFIG_xxx`: (e.g., `CONFIG_UPDATE_REQUIRED`)
- `COMMON_xxx`: (e.g., `COMMON_INTERNAL_ERROR`, `COMMON_RATE_LIMITED`)

## HTTP Mapping
- `400 Bad Request`: Validation errors, Invalid parameters.
- `401 Unauthorized`: Invalid or missing tokens.
- `403 Forbidden`: Insufficient RBAC permissions.
- `404 Not Found`: Resource does not exist.
- `409 Conflict`: Business rule violation (e.g., Booking already in progress).
- `429 Too Many Requests`: Rate limit exceeded.
- `500 Internal Server Error`: Unhandled exceptions.

## Error Categories
- **Retryable errors**: Network timeouts, optimistic concurrency lock failures. Clients should implement exponential backoff.
- **Validation errors**: Input validation failures (e.g., Zod schemas). Must return `400` with a `details` array containing field-specific violations.
