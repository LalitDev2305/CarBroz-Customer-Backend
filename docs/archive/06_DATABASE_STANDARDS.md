---
Version: 1.0.0
Status: FROZEN
Owner: CarBroz Architecture Team
Last Updated: 2026-08-02
---

# 06 Database Standards

## Prisma Rules
- Direct Prisma usage inside Controllers is banned. Use Repositories.
- `schema.prisma` must represent the unified schema across the Modular Monolith.

## Field Constraints
- **UUID**: All public IDs must be UUIDv7. No sequential integers.
- **UTC**: All timestamps must be stored in UTC.
- **Money**: All currency values are stored as Integers / BigInt representing the lowest denominator (e.g., paise/cents). Floating points are strictly prohibited.
- **Soft Delete**: `deletedAt` field required on core entities. Hard deletion is forbidden unless for GDPR compliance orchestration.

## Indexes & Migrations
- Foreign keys must always be explicitly indexed.
- **Expand-and-Contract Migration Rule**: 
  1. Add new column/table (Deploy).
  2. Write to both old and new (Deploy).
  3. Read from new (Deploy).
  4. Drop old column/table (Deploy).
  Never rename columns directly in a single deployment.
