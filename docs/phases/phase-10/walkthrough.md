# Walkthrough: Phase 10

## Overview
Phase 10 implemented the KYC document upload and admin verification workflow.

## Key Changes
1. **Database**: Migrated `PartnerProfile` and `KycDocument`.
2. **Repositories**: Ensured `PrismaKycDocumentRepository` implements `findAll` and `save` compliant with `IRepository`.
3. **Use Cases**: Built clean architecture use cases enforcing RBAC (e.g. `OWNER`, `MANAGER`) and executing logic without fastify request leakages.
4. **Storage**: Made MinIO initialization lazy to smoothly work within the DI container when async configurations (like `MINIO_ENDPOINT`) are queried.
5. **Controllers**: Exposed `/partners/:partnerId/kyc` and admin routes to handle file buffer uploading efficiently via `@fastify/multipart`.

## Verification
- Unit and integration tests cover controller DTO validations and Use Case business constraints.
- `pnpm lint` and `pnpm test` successfully validate 100% of cases.
