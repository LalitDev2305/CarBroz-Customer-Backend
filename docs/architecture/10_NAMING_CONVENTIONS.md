---
Version: 1.0.0
Status: FROZEN
Owner: CarBroz Architecture Team
Last Updated: 2026-08-02
---

# 10 Naming Conventions

To maintain uniformity across the monorepo, strict naming conventions must be followed.

## General
- **Folder naming**: `kebab-case` (e.g., `feature-flags`, `auth-module`).
- **File naming**: `kebab-case` with type suffix (e.g., `user.controller.ts`, `send-otp.usecase.ts`).
- **Environment variable naming**: `UPPER_SNAKE_CASE` (e.g., `DATABASE_URL`, `JWT_SECRET`).
- **Docker service naming**: `kebab-case` (e.g., `postgres-db`, `redis-cache`).

## Code Level
- **Class naming**: `PascalCase` (e.g., `UserService`, `PaymentGateway`).
- **Interface naming**: `PascalCase` prefixed with `I` (e.g., `IUserRepository`).
- **Method naming**: `camelCase` (e.g., `findById`, `calculateTax`).
- **DTO naming**: `PascalCase` suffixed with `Dto` (e.g., `CreateBookingDto`).
- **Enum naming**: `PascalCase` for the Enum name, `UPPER_SNAKE_CASE` for values (e.g., `enum BookingStatus { IN_PROGRESS }`).

## Domain & Infrastructure
- **Database naming**: `PascalCase` for tables/models in Prisma (e.g., `UserSession`). `camelCase` for columns (e.g., `phoneNumber`).
- **API naming**: RESTful `kebab-case` plural nouns (e.g., `/v1/users`, `/v1/bookings`).
- **Event naming**: `PascalCase`, past tense (e.g., `BookingCreatedEvent`).
- **Queue naming**: `kebab-case` by domain (e.g., `booking-workflow-queue`).
- **Cron naming**: `PascalCase` suffixed with `Job` (e.g., `SlotReleaseJob`).
- **Redis key naming**: `domain:entity:id` (e.g., `auth:session:123`, `catalog:service:abc`).
