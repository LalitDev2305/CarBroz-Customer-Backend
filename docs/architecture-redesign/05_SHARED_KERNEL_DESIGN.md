# 05 — Shared Kernel Minimal Design Blueprint

## Executive Summary
This document defines the strict, minimal boundary of `@carbroz/common-kernel` to prevent it from ever becoming an overstuffed, monolithic dump of domain entities.

---

## 1. What Belongs in `@carbroz/common-kernel`

Only foundational, domain-agnostic TypeScript building blocks and immutable value objects belong in `@carbroz/common-kernel`:

1. **Domain Base Abstractions**:
   - `Entity<T>`: Abstract base class for domain entities with identifier equality.
   - `AggregateRoot<T>`: Extension of `Entity` supporting domain event registration.
   - `ValueObject<T>`: Immutable value object base class with structural equality.
   - `IDomainEvent`: Base interface for domain events.
   - `Result<T, E>`: Functional error/success result wrapper.

2. **Universal Value Objects**:
   - `Money`: Immutable currency & paise handling value object with arithmetic methods (`add`, `subtract`, `multiply`, `allocatePercentage`, `toINRString`).
   - `Coordinates`: Immutable latitude/longitude location value object with Haversine distance calculation.
   - `AddressSnapshot`: Freeze-dried location value object for immutable historical snapshots in Bookings and Invoices.

3. **Core Repository Port Standards**:
   - `IRepository<T>`: Marker interface for repositories.
   - `IReadRepository<T>`: Base query operations (`findById`, `listAll`).
   - `IWriteRepository<T>`: Base mutation operations (`save`, `delete`).

4. **Universal Errors**:
   - `DomainError`, `NotFoundError`, `ValidationError`, `UnauthorizedError`, `ConflictError`.

---

## 2. What Is STRICTLY FORBIDDEN in `@carbroz/common-kernel`

- ❌ Business Domain Entities (`User`, `Booking`, `Service`, `Partner`, `Invoice`, `CorporateAccount`).
- ❌ Feature-specific DTOs or Zod schemas.
- ❌ Feature-specific repository interfaces (`IBookingRepository`, `ICustomerProfileRepository`).
- ❌ HTTP Request / Fastify handlers.
- ❌ Prisma Client models.
- ❌ Framework or library dependencies beyond lightweight utilities.
