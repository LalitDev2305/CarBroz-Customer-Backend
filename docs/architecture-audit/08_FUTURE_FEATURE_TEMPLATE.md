# 08 — Future Feature Standard Implementation Template

When adding a new feature or bounded context to CarBroz, developers must follow this exact standardized structure:

## 1. Domain Layer (`packages/common/src/domain/<feature>/`)
```
packages/common/src/domain/<feature>/
├── <Feature>Entity.ts                     # Core domain aggregate root
├── value-objects/                         # Immutable value objects
├── repositories/
│   └── I<Feature>Repository.ts            # Repository interface contract
└── services/                              # Domain calculation services
```

## 2. Infrastructure Layer (`packages/database/src/repositories/`)
```
packages/database/src/repositories/
└── Prisma<Feature>Repository.ts          # Concrete Prisma repository implementation
```

## 3. Application & Delivery Layer (`apps/backend-api/src/modules/<feature>/`)
```
apps/backend-api/src/modules/<feature>/
├── dtos/
│   └── <feature>.dto.ts                  # Zod schemas and TypeScript DTO types
├── use-cases/
│   └── <Verb><Feature>UseCase.ts          # Application use case implementation
├── controllers/
│   ├── <Feature>Controller.ts             # Customer/Public API controller
│   └── Admin<Feature>Controller.ts        # Admin API controller (if applicable)
├── routes/
│   ├── <feature>.routes.ts               # Customer route definitions
│   └── admin-<feature>.routes.ts         # Admin route definitions
└── ui/
    └── <Feature>Builder.ts               # SDUI builder (if screen layout required)
```

## 4. Container & Verification Checklist
1. Register Repository in `packages/database/src/index.ts`.
2. Register Repository, Use Cases, Controller in `apps/backend-api/src/container/index.ts`.
3. Register Routes in `apps/backend-api/src/app.ts`.
4. Add unit test suite in `apps/backend-api/tests/<feature>-engine.test.ts`.
5. Run verification sequence: `pnpm build`, `pnpm test`, `pnpm exec eslint --quiet .`.
