# 09 — Database Infrastructure & Prisma Architecture

## Executive Summary
This document defines the database architecture for CarBroz, balancing relational schema integrity with modular feature persistence.

---

## 1. Unified Prisma Schema & Database Client (`packages/database`)
- **Single Prisma Schema (`schema.prisma`)**: Maintained in `@carbroz/database` to preserve cross-table relational integrity (foreign keys between `Booking`, `User`, `Vehicle`, `CorporateAccount`, `Payment`, `Invoice`).
- **Prisma Client Generation**: `@prisma/client` is generated once in `@carbroz/database` and exposed to feature infrastructure layers.
- **Database Transactions (`PrismaTransactionProvider`)**: Implements `ITransactionProvider` port from `@carbroz/common-kernel`, allowing use cases to execute multi-repository atomic transactions without exposing Prisma directly to application logic.

---

## 2. Feature Persistence Co-Location
While `@carbroz/database` owns `schema.prisma` and the generated Prisma Client instance, **concrete Prisma repositories sit inside their respective feature package/module**:
- `features/auth/infrastructure/repositories/PrismaUserRepository.ts`
- `features/booking/infrastructure/repositories/PrismaBookingRepository.ts`
- `features/payment/infrastructure/repositories/PrismaPaymentRepository.ts`
- `features/corporate/infrastructure/repositories/PrismaCorporateAccountRepository.ts`

This co-location keeps feature persistence implementation code next to feature use cases and domain models.
