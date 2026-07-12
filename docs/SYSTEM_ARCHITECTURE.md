
# SYSTEM_ARCHITECTURE.md

# CarBroz Backend System Architecture

Version: 1.0

## 1. Purpose
This document defines the system architecture for the CarBroz Backend Platform.
The backend serves the Customer App today and the Partner App and Admin Panel in the future.

## 2. Core Principles
- Modular Monolith
- Clean Architecture
- Domain-driven module boundaries
- API-first
- Event-driven communication between modules
- Loose coupling
- High cohesion
- Testability
- Scalability

## 3. Technology Stack
- Node.js
- TypeScript
- Fastify
- Prisma
- PostgreSQL
- Redis
- BullMQ
- MinIO
- Docker
- Zod
- Pino
- Vitest

## 4. Layered Architecture

Presentation
↓
Application
↓
Domain
↓
Infrastructure
↓
Database / External Services

### Presentation
Responsibilities:
- Fastify routes
- Controllers
- Validation
- Authentication
- Response mapping

Must NOT contain:
- Business logic
- Prisma queries

### Application
Responsibilities:
- Use Cases
- Commands
- Queries
- Transactions
- Business orchestration

Must NOT contain:
- HTTP code
- Fastify objects
- SQL

### Domain
Responsibilities:
- Entities
- Value Objects
- Business Rules
- Interfaces
- Domain Events

Must be framework independent.

### Infrastructure
Responsibilities:
- Prisma repositories
- Redis
- MinIO
- BullMQ
- Payment gateways
- Notification providers

## 5. Request Lifecycle

Client
→ Route
→ Controller
→ Validator
→ Use Case
→ Repository Interface
→ Repository Implementation
→ Database

Response returns through the same chain.

## 6. Module Communication

Modules must never access another module's private implementation.

Allowed:
- Public interfaces
- Domain events
- Shared abstractions

Forbidden:
- Direct repository access across modules
- Circular dependencies

## 7. Dependency Rule

Presentation
depends on
Application

Application
depends on
Domain

Infrastructure
implements
Domain interfaces

Domain depends on nothing.

## 8. Event Architecture

Examples:
- UserRegistered
- BookingCreated
- BookingCompleted
- PaymentSucceeded
- NotificationRequested

Events should be asynchronous where appropriate.

## 9. Background Jobs

BullMQ is used for:
- OTP
- Push notifications
- Emails
- Invoice generation
- Scheduled reminders

## 10. Authentication

JWT Access Token
Refresh Token
OTP Login
Device Session

Role Based Access Control:
- Customer
- Partner
- Admin

## 11. Validation

All input validation uses Zod.

Validation occurs before entering the application layer.

## 12. Error Handling

Global error handler.

Standard response:

{
  "success": false,
  "code": "BOOKING_NOT_FOUND",
  "message": "Booking not found",
  "traceId": "..."
}

## 13. Logging

Pino logger.

Log:
- Requests
- Responses
- Errors
- Background jobs

Never log:
- Passwords
- OTP
- Tokens

## 14. Database

Single PostgreSQL database.

Prisma is the only ORM.

No raw SQL unless justified.

## 15. Caching

Redis caches:
- Home page
- Services
- CMS
- Settings

Cache invalidation is event-driven.

## 16. Storage

MinIO locally.

S3-compatible object storage in production.

## 17. API Standards

/api/v1/auth
/api/v1/customer
/api/v1/booking
/api/v1/service
/api/v1/payment
/api/v1/template

## 18. Security

- Helmet
- CORS
- JWT
- Rate Limiting
- Input Validation
- Parameterized queries
- Secrets via environment variables

## 19. Scalability

Future components:
- Customer App
- Partner App
- Admin Panel
- Worker Service

Current architecture must support extracting modules into microservices later without changing domain logic.

## 20. Development Rules

- Controllers stay thin.
- Use Cases own business logic.
- Repositories access persistence.
- Domain never imports Fastify or Prisma.
- Every module contains unit tests.
- Shared code belongs only in shared packages.

End of Document.
