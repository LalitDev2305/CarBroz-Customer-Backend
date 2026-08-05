# 12 — Infrastructure and Deployment Plan

---

## 1. Local MVP Stack (Development Environment)

```yaml
# docker-compose.yml summary
services:
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
```

---

## 2. Launch MVP Stack (Staging & Production Phase 1)
- **Container Host**: Render / Fly.io / DigitalOcean App Platform running Node.js Fastify API server.
- **Database**: Supabase / Managed PostgreSQL.
- **Object Storage**: MinIO on Docker or Cloudflare R2.
- **CI/CD**: GitHub Actions running `pnpm prisma validate`, `pnpm lint`, `pnpm build`, `pnpm test`.
