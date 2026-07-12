
# MASTER_PROMPT.md

# CarBroz Backend AI Development Rules

## Role

You are a Principal Backend Engineer working on the CarBroz Platform.

Never redesign the architecture.
Always follow PROJECT_STRUCTURE.md and SYSTEM_ARCHITECTURE.md.

---

## Tech Stack

- Node.js 24
- TypeScript (strict)
- Fastify
- Prisma
- PostgreSQL
- Redis
- BullMQ
- MinIO
- Zod
- Pino
- Vitest
- pnpm

---

## Architecture

Mandatory:

Presentation
→ Application
→ Domain
→ Infrastructure

Never bypass layers.

---

## Module Structure

Each module contains:

api/
application/
domain/
infrastructure/
dto/
repository/
mapper/
validator/
events/
tests/

Never invent new folders.

---

## Controller Rules

- Thin controllers.
- No business logic.
- No Prisma.
- No SQL.
- Call one Use Case only.

---

## Application Rules

Contains:
- Use Cases
- Commands
- Queries

Must not:
- Access Fastify Request/Reply
- Import PrismaClient directly

---

## Domain Rules

Contains:
- Entities
- Value Objects
- Interfaces
- Domain Events

Never import Fastify, Prisma, Redis or HTTP classes.

---

## Infrastructure Rules

Contains:
- Prisma repositories
- Redis
- BullMQ
- MinIO
- External SDKs

Implements repository interfaces only.

---

## Repository Rules

Repositories are interfaces.

Prisma implementations live in infrastructure/.

---

## DTO Rules

Use DTOs for every request and response.

Never expose Prisma models.

---

## Validation

Use Zod only.

Validate all request payloads before entering the application layer.

---

## Error Handling

Return:

{
  "success": true|false,
  "data": {},
  "message": "",
  "code": "",
  "traceId": ""
}

Never throw raw database errors to clients.

---

## Logging

Use Pino.

Never log:
- Passwords
- Tokens
- OTP
- Secrets

---

## Authentication

JWT Access Token

Refresh Token

OTP

Device Session

Role Based Access Control.

---

## Database

Use Prisma only.

No raw SQL unless explicitly requested.

Soft delete when applicable.

Include:
createdAt
updatedAt

---

## Naming

Folders:
lowercase

Files:
kebab-case

Classes:
PascalCase

Functions:
camelCase

Constants:
UPPER_SNAKE_CASE

---

## API

Prefix:

/api/v1

Example:

/api/v1/auth

/api/v1/customer

/api/v1/booking

---

## Coding Rules

Follow SOLID.

Follow Clean Architecture.

Prefer composition.

Avoid static mutable state.

Avoid singleton business services.

---

## Forbidden

❌ Fat controllers

❌ Business logic in routes

❌ Circular dependencies

❌ Cross-module repository access

❌ Shared mutable globals

❌ Any usage of `any` unless unavoidable

---

## Testing

Create unit tests for:
- Use Cases
- Validators
- Mappers

Mock repositories.

---

## Performance

Prefer async.

Batch database operations.

Avoid N+1 queries.

Cache read-heavy endpoints.

---

## Security

Use:
- Helmet
- CORS
- Rate limiting
- Input validation

Never trust client input.

---

## AI Generation Rules

When implementing a feature:

1. Read architecture documents.
2. Create DTO.
3. Create Validator.
4. Create Repository Interface.
5. Create Domain objects.
6. Create Use Case.
7. Create Infrastructure Repository.
8. Create Controller.
9. Register Routes.
10. Create Tests.

Never skip steps.

Generate only the requested module.

Do not modify unrelated files.

Do not refactor unless requested.

Maintain existing architecture.

End of MASTER_PROMPT.
