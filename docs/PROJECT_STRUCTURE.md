# CarBroz Backend - Project Structure

Version: 1.0

Status: Approved Architecture

---

# 1. Purpose

This document defines the official folder structure of the CarBroz Backend Platform.

Every developer, AI agent (Antigravity), and contributor MUST follow this structure.

No module may introduce a new structure without architectural approval.

---

# 2. High Level Structure

backend/

├── apps/
├── packages/
├── infrastructure/
├── docs/
├── prompts/
├── .github/
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
└── README.md

---

# 3. apps/

Contains executable applications.

Current

apps/
    backend-api/

Future

apps/
    worker/

apps/
    admin-panel/

Only executable applications belong here.

Never place shared code inside apps.

---

# 4. backend-api/

apps/backend-api/

Contains the REST API.

Structure

src/

config/

plugins/

shared/

modules/

events/

jobs/

middlewares/

types/

utils/

app.ts

server.ts

---

# 5. Config

src/config/

Contains

Environment

Application Config

Database Config

Redis Config

JWT Config

Storage Config

Swagger Config

Never put business logic here.

---

# 6. Plugins

src/plugins/

Contains Fastify plugins.

Examples

JWT

Prisma

Redis

Pino

Swagger

Helmet

Cors

Plugins only.

No services.

---

# 7. Shared

src/shared/

Contains reusable code.

shared/

constants/

exceptions/

responses/

validators/

decorators/

types/

interfaces/

helpers/

logger/

Never place feature logic here.

---

# 8. Modules

Every business feature becomes one module.

Example

modules/

auth/

customer/

partner/

booking/

vehicle/

address/

payment/

wallet/

membership/

coupon/

service/

notification/

review/

support/

media/

cms/

template/

settings/

Every feature is isolated.

Never mix code across modules.

---

# 9. Module Structure

Example

booking/

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

This structure is mandatory.

---

# 10. api/

Contains

Routes

Controllers

Schemas

Nothing else.

Never place business logic.

---

# 11. application/

Contains

Use Cases

Commands

Queries

Business workflows

No database access.

---

# 12. domain/

Contains

Entities

Business Rules

Value Objects

Enums

Interfaces

Pure business logic.

No framework code.

---

# 13. infrastructure/

Contains

Repository implementations

External integrations

Storage

Redis

Payment gateways

Notification providers

Only infrastructure code.

---

# 14. dto/

Contains

Request DTO

Response DTO

View Models

Never expose Prisma models directly.

---

# 15. repository/

Contains

Repository interfaces only.

Implementation belongs inside infrastructure.

---

# 16. mapper/

Responsible for

DTO ↔ Domain

Domain ↔ Database

Database ↔ Response

Never map inside controllers.

---

# 17. validator/

Contains

Zod Schemas

Validation helpers

No business rules.

---

# 18. events/

Contains

Domain Events

Application Events

Integration Events

No HTTP logic.

---

# 19. tests/

Every module owns its own tests.

Unit

Integration

Mocks

Fixtures

---

# 20. Events

src/events/

Global event bus.

Examples

BookingCreated

PaymentCompleted

UserRegistered

NotificationRequested

---

# 21. Jobs

src/jobs/

BullMQ workers.

Examples

Send OTP

Send Email

Push Notification

Generate Invoice

Never call jobs directly from controllers.

---

# 22. Middleware

src/middlewares/

Authentication

Authorization

Request Logger

Error Handler

Rate Limiter

---

# 23. Utils

src/utils/

Pure utility functions.

Stateless.

No database.

---

# 24. Types

src/types/

Global types.

Enums

Interfaces

Generics

---

# 25. Packages

packages/

Contains reusable internal libraries.

Example

logger/

validation/

database/

config/

common/

These packages must have no business knowledge.

---

# 26. Infrastructure

infrastructure/

Contains deployment resources.

docker/

nginx/

scripts/

deployment/

terraform/ (future)

---

# 27. Docs

docs/

Architecture

API

Database

Security

Deployment

Development Guide

---

# 28. Prompts

prompts/

MASTER_PROMPT.md

Every Antigravity prompt starts by following MASTER_PROMPT.md.

---

# 29. Dependency Rule

Controller

↓

Use Case

↓

Repository Interface

↓

Repository Implementation

↓

Database

Never skip layers.

---

# 30. Import Rules

Allowed

Module → Shared

Module → Config

Module → Packages

Forbidden

Booking → Payment Infrastructure

Customer → Booking DTO

Module → Another Module Repository

Use Events instead.

---

# 31. Naming Convention

Folders

lowercase

Files

kebab-case

Classes

PascalCase

Functions

camelCase

Constants

UPPER_SNAKE_CASE

Interfaces

Prefix I only when meaningful.

---

# 32. File Size Limits

Controller

<200 lines

Use Case

<300 lines

Repository

<250 lines

DTO

<150 lines

Validator

<200 lines

Split large files.

---

# 33. Module Independence

Every module should be removable with minimal changes.

Modules communicate through:

Events

Interfaces

Public APIs

Never through private implementation.

---

# 34. Forbidden

No circular dependency

No business logic inside controllers

No Prisma inside controller

No HTTP inside domain

No DTO inside domain

No database inside use case

No singleton state

No static mutable state

---

# 35. Future Expansion

Customer App

Partner App

Admin Panel

Public API

Internal API

Analytics

Worker

The folder structure must support future applications without refactoring.

---
