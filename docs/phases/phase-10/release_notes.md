# Phase 10: Release Notes

## Added
- KYC Document Domain Entities & Prisma schemas.
- `UploadKycDocumentUseCase` for partners.
- `GetPartnerKycStatusUseCase` for querying status.
- `AdminReviewKycDocumentUseCase` for verification workflows.
- Partner and Admin Fastify controllers for KYC document routes.
- Fully integrated `MinIOStorageProvider` with dynamic awilix configuration.

## Changed
- Repository interfaces aligned with unified generic `IRepository` structure (`findAll`, `save`).
- Fixed types across route generics to correctly match standard `FastifyRequest`.
