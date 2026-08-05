# 07 — Database and Migration Audit

---

## 1. Database Schema & Prisma Architecture

- **Schema Location**: `packages/database/prisma/schema.prisma`
- **Client Generation**: `@prisma/client` generated to `node_modules` cleanly.
- **Validation Status**: `pnpm prisma validate` returns **100% valid schema**.

### Core Tables & Models
1. `sdui_screens`: Screen layouts, versions, statuses (`DRAFT`, `PUBLISHED`, `ARCHIVED`), lock versioning (`lockVersion`), publishing timestamps.
2. `sdui_component_registry`: Single unified registry table with `nodeLevel` column storing components, subcomponents, children, and childrenData.
3. `sdui_templates`: Layout templates.
4. `users`, `user_sessions`, `roles`, `permissions`, `admin_user_roles`: Security & RBAC.
5. `partners`, `partner_profiles`, `kyc_documents`: Partner onboarding.
6. `customer_profiles`, `addresses`: Customer management.
7. `service_categories`, `services`, `pricing_tiers`: Catalog pricing.

### Recommendations
- Retain single unified `sdui_component_registry` table. Do NOT create separate database tables for subcomponents or children.
- Ensure composite index on `(screenId, targetApp, versionNumber)` for rapid lookup.
