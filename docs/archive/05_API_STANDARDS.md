---
Version: 1.0.0
Status: FROZEN
Owner: CarBroz Architecture Team
Last Updated: 2026-08-02
---

# 05 API Standards

## API Conventions
- All APIs follow strict RESTful naming where possible. Action endpoints (e.g., `/cancel`) are permitted for complex state transitions.
- All endpoints must sit behind `/v1/`.

## Success & Error Responses
- **Success Format**:
  ```json
  { "success": true, "data": { ... }, "meta": { ... } }
  ```
- **Error Format**:
  ```json
  { "success": false, "error": { "code": "VALIDATION_FAILED", "message": "...", "details": [] } }
  ```

## Query Parameters
- **Pagination**: Mandatory `page` and `limit`.
- **Filtering**: Provided in `filter[status]=active` format.
- **Sorting**: Standardized as `sort=-createdAt` (descending).

## Request Headers
- `x-correlation-id`: Mandatory for cross-service tracking.
- `x-request-id`: Mandatory per discrete request.
- `x-idempotency-key`: **Mandatory** for any POST/PUT mutating state or executing financial transactions.
