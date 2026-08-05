# 11 — MVP Technology Decisions & Provider Strategy

---

## 1. Low-Cost & Replaceable MVP Stack Recommendation

| Capability | Recommended MVP Choice | Production Scale Option | Vendor Lock-in Mitigation |
| :--- | :--- | :--- | :--- |
| **Database & Auth** | Supabase Postgres (Free Tier) | AWS RDS PostgreSQL | Prisma ORM abstraction hides vendor details. |
| **File Storage** | MinIO (Self-hosted/Docker) | AWS S3 / Cloudflare R2 | `IStorageProvider` interface abstraction. |
| **Maps & Geocoding** | OpenStreetMap / Nominatim / Mapbox Free | Google Maps Platform API | `IMapsProvider` interface abstraction. |
| **SMS Gateway** | Msg91 / Twilio Free Tier | AWS SNS / Twilio Paid | `ISmsProvider` interface abstraction. |
| **Email Gateway** | Resend / SendGrid (Free Tier) | AWS SES | `IEmailProvider` interface abstraction. |
| **Caching** | Redis (Docker / Upstash Free) | AWS ElastiCache | In-memory fallback / Redis interface. |

---

## 2. Supabase Evaluation & Recommendation

- **Verdict**: **RECOMMENDED FOR MVP BASE DATABASE**.
- **Usage Strategy**: Use Supabase as a standard hosted PostgreSQL database via standard Prisma connection string (`DATABASE_URL`).
- **Caution**: Do NOT tightly couple application code to Supabase-specific client SDKs or proprietary RLS features in business logic; route all persistence through Prisma repositories and `packages/common` domain models.
