# Phase 1 Release Notes

- **Feature**: Added Awilix Dependency Injection container in strict mode.
- **Feature**: Scaffolded `@carbroz/common` with core Clean Architecture interfaces (Repositories, Providers, UseCases, Entities).
- **Refactor**: Replaced Jest with Vitest for workspace testing. 85% coverage threshold implemented.
- **Fix (Blocker Resolved)**: Implemented ESLint Flat Configuration (`eslint.config.mjs`) compatible with ESLint v10 to restore workspace linting. Included specific tweaks to support DDD marker interfaces.
