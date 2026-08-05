# Phase P1 Execution Plan — Partner KYC, Slot Booking & Media Storage

Detailed execution plan for Phase P1 production capabilities.

## 1. Scope & Capabilities
- **Partner KYC Approval Workflow**: Upload PAN/Aadhar/GST/License, Admin verification use cases, state transitions (`PENDING` → `APPROVED` / `REJECTED`).
- **Service Slot Management**: Open slot calculation engine considering partner radius, buffer times, and maximum hourly capacity.
- **Media Storage Integration**: Supabase / S3 Presigned URL generation for vehicle photos and partner KYC documents (`platform/storage`).

---

## 2. APIs & Endpoints
- `POST /api/v1/partners/kyc/upload` (Partner document upload)
- `POST /api/v1/admin/partners/kyc/verify` (Admin KYC review & status update)
- `GET /api/v1/slots/available` (Fetch open service slots)
- `POST /api/v1/storage/presigned-url` (Generate presigned upload URL)

---

## 3. SDUI Screens
- `partner_kyc_screen`
- `slot_picker_screen`

---

## 4. Technology & Swappable Provider
- **Storage Provider**: Supabase Storage (S3 Protocol - **FREE Tier**). Swappable to AWS S3, Cloudflare R2, MinIO via `.env` `S3StorageProvider`.

---

## 5. Quality & Coverage Targets
- Domain Layer: 100%
- Application Use Cases: 100%
- Repositories: 100%
- Overall Coverage Target: 95%+
