# Phase 10: Partner Onboarding and KYC Foundation

## Goal
Implement the foundation for Partner onboarding and Know Your Customer (KYC) verification, allowing Partners to upload necessary documents and Admins to review and approve them.

## Scope
- Prisma models for PartnerProfile and KycDocument
- Partner Profile Repository implementation
- KYC Document Repository implementation
- Upload KYC Document Use Case (Partner facing)
- Get Partner KYC Status Use Case (Partner facing)
- Admin Review KYC Document Use Case (Admin facing)
- API Endpoints (Fastify) and DTOs
- Dependency Injection (Awilix) registrations
- Unit Tests
- MinIO Storage provider integration with lazy client initialization

## Implementation Details
- `UploadKycDocumentUseCase`: Handles partner uploads via Fastify multipart and MinIO.
- `GetPartnerKycStatusUseCase`: Returns KYC status for a partner.
- `AdminReviewKycDocumentUseCase`: Allows admins to approve or reject KYC documents, and auto-upgrades Partner status to ACTIVE when verification criteria is met.

## Status
**Completed** and merged to feature branch.
