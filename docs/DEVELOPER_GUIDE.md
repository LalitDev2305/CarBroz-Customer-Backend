# Developer Onboarding & Architecture Guide

Guide for engineering onboarding, workspace setup, and development standards.

## 1. Quick Start Guide

```bash
# 1. Install workspace dependencies
pnpm install

# 2. Build all workspace packages
pnpm -r build

# 3. Execute unit & integration tests
pnpm test

# 4. Run workspace linter
pnpm lint

# 5. Start backend API dev server
pnpm --filter "backend-api" dev
```

---

## 2. Key Architecture Directives

1. **4-Pillar Layering**: `apps` -> `domains` -> `platform` -> `shared`.
2. **Public Barrels Only**: Import cross-domain dependencies exclusively via `@carbroz/domain-<name>`.
3. **No SDUI Hardcoding**: Dynamic UI components must consume `node.children` and parse properties using `ModifierParser`.
