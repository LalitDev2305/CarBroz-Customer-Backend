# Enterprise Performance Review & Optimization Strategy

Performance profiling and throughput optimizations across database, cache, and queue infrastructure.

## 1. Database & Prisma Query Optimization

- **Connection Pooling**: Prisma Client configured with explicit pool limits (`connection_limit=20`) to prevent DB socket exhaustion.
- **Selective Field Fetching**: Repositories project specific fields (`select` clause) to minimize payload overhead over the wire.
- **Index Alignment**: Foreign keys, status fields, and soft-delete columns (`deletedAt`) indexed in `prisma/schema.prisma`.

---

## 2. Multi-Level Caching (`@carbroz/cache`)

- **L1 In-Memory / L2 Redis**: High-frequency metadata (Catalog Services, System Config, SDUI Templates) cached with dynamic TTLs.
- **Cache Invalidation**: Mutation use cases dispatch invalidation keys upon updating records.

---

## 3. Asynchronous Queue Processing (`@carbroz/queue`)

- **BullMQ Workers**: Heavy processing tasks (Push Notifications, Email dispatches, Invoice PDF generation, Audit logging) offloaded asynchronously to background queues.
