# API Response Contract

This folder owns the canonical HTTP response envelope for `apps/api`. It is a transport concern and does not move business or SDUI ownership into the API layer. The normative architecture authority remains `docs/MASTER-BACKEND-CONSTITUTION.md`.

## Envelope

Successful and failed JSON responses use the same transport fields:

```text
ApiResponse<T>
├── status   HTTP status repeated in the body for client consumption
├── code     stable string derived from the HTTP status
├── message  human-readable operation/result message
├── data     successful resource; null for mapped failures
└── traceId  request correlation identifier when available
```

`message` is presentation/debug information for humans. Client business logic MUST NOT branch on message text.

The actual HTTP response status and body `status` MUST agree. Controllers must not return HTTP 200 for a failed operation.

## Canonical status mapping

| HTTP/body status | code | Meaning |
| ---: | --- | --- |
| 200 | `SUCCESS` | Request completed successfully |
| 400 | `BAD_REQUEST` | Invalid or malformed request |
| 401 | `UNAUTHORIZED` | Authentication is missing or invalid |
| 403 | `FORBIDDEN` | Authenticated caller is not permitted |
| 404 | `NOT_FOUND` | Requested resource does not exist |
| 409 | `CONFLICT` | Request conflicts with current resource/state |
| 422 | `UNPROCESSABLE_ENTITY` | Validation or business-input failure |
| 429 | `TOO_MANY_REQUESTS` | Existing API rate limit was exceeded |
| 500 | `INTERNAL_SERVER_ERROR` | Unexpected server failure |

`429` is retained because the existing Fastify rate-limit boundary already uses the standard HTTP rate-limit status. It is not a new business/API outcome invented for this change.

The mapping is centralized in `ResponseHelper.ts`; product controllers must not create competing status-to-code maps.

## Example success

```json
{
  "status": 200,
  "code": "SUCCESS",
  "message": "Partner login screen fetched successfully.",
  "data": {
    "screenId": "partner_login",
    "schemaVersion": "3.0.0",
    "targetApp": "PARTNER",
    "theme": {},
    "template": {}
  },
  "traceId": "request-trace-id"
}
```

For SDUI responses, `data` is the screen resource. `theme` therefore remains owned by the screen document; the API envelope does not own or reinterpret SDUI structure.

## Example failure

```json
{
  "status": 404,
  "code": "NOT_FOUND",
  "message": "The requested screen could not be found.",
  "data": null,
  "traceId": "request-trace-id"
}
```

Do not expose stack traces, SQL/provider errors, secrets, tokens, OTPs, or unnecessary PII through `message`.
