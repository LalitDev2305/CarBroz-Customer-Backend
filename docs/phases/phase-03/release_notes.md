# Release Notes: Phase 3
**Database Core**

## Features
- **Prisma Integration**: Successfully introduced Prisma Client and Prisma ORM into the workspace inside the `@carbroz/database` package.
- **Schema Foundation**: Scaffolded the initial schema with core infrastructure tables (`User`, `Role`, `Permission`, `RefreshToken`) adhering strictly to UTC timestamps, integer primary keys, and UUIDv7 public IDs.
- **Transactions & Repositories**: Integrated a generic Repository factory and transactional abstractions to ensure Clean Architecture principles are upheld in the Application/Domain layer.
- **Readiness Probes**: The API health endpoints now actively poll the database status to ensure production orchestration systems correctly route traffic.

## Developer Experience
- `pnpm prisma generate` and `pnpm prisma validate` are configured correctly within the monorepo via the root `prisma.config.ts`.
- Mocking structures have been laid down in `vitest` for the database providers to ensure fast, isolated testing.
