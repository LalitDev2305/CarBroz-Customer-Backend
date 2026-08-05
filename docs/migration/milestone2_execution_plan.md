# Milestone 2 — Core Domains Migration Playbook & Execution Plan

Step-by-step execution guide for migrating Core Domains (`identity`, `customer-profile`, `address`, `partner-profile`, `partner-kyc`, `catalog`, `pricing`, `garage`).

## Execution Batches

### Batch 2.1: Identity Domain
1. Create `domains/identity/`.
2. Extract `User`, `UserSession`, `Role`, `Permission` models to `domains/identity/domain/`.
3. Move `PrismaUserRepository`, `PrismaUserSessionRepository` to `domains/identity/infrastructure/repositories/`.
4. Move `AuthLoginBuilder` to `domains/identity/ui/`.
5. Create `identity.module.ts` and `public/index.ts`.
6. Run `pnpm -r build` & `pnpm test`.

### Batch 2.2: Customer Profile & Address Domains
1. Create `domains/customer-profile/` and `domains/address/`.
2. Extract `CustomerProfile` and `Address` models & repositories.
3. Create `customer-profile.module.ts`, `address.module.ts`, and `public/index.ts`.
4. Run `pnpm -r build` & `pnpm test`.

### Batch 2.3: Partner Profile & KYC Domains
1. Create `domains/partner-profile/` and `domains/partner-kyc/`.
2. Extract `Partner`, `PartnerMember`, `KycDocument` models & repositories.
3. Create Awilix modules & `public/index.ts`.
4. Run `pnpm -r build` & `pnpm test`.

### Batch 2.4: Catalog, Pricing & Garage Domains
1. Create `domains/catalog/`, `domains/pricing/`, and `domains/garage/`.
2. Extract `ServiceCategory`, `Service`, `PricingTier`, `Vehicle` models & repositories.
3. Create Awilix modules & `public/index.ts`.
4. Run `pnpm -r build` & `pnpm test`.

---

## Stop Point Directive

> [!CAUTION]
> This document completes the **Milestone 2 Analysis Phase**. Zero code modification will take place until the user provides explicit approval to start execution.
