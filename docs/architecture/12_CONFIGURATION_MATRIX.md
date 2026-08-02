---
Version: 1.0.0
Status: FROZEN
Owner: CarBroz Architecture Team
Last Updated: 2026-08-02
---

# 12 Configuration Matrix

This matrix defines the provider landscape, establishing the abstraction boundaries for all external services.

## Providers

### Database
- **Current MVP**: PostgreSQL
- **Future Enterprise**: AWS Aurora Serverless
- **Environment Variables**: `DATABASE_URL`
- **Fallback Strategy**: Read-replicas if master fails.
- **Migration Strategy**: Connection string update and Prisma client generation target updates.

### Cache
- **Current MVP**: Local Redis (Docker)
- **Future Enterprise**: AWS ElastiCache / Redis Enterprise
- **Environment Variables**: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- **Fallback Strategy**: Graceful degradation (serve stale data or fallback to DB).
- **Migration Strategy**: Transparent switch via `ICacheProvider` injection.

### Queue
- **Current MVP**: BullMQ (Redis backed)
- **Future Enterprise**: Apache Kafka / AWS SQS
- **Environment Variables**: `QUEUE_DRIVER`, `QUEUE_REDIS_URL`
- **Fallback Strategy**: DLQ for failed events.
- **Migration Strategy**: Implement `IQueueProvider` for Kafka. Swap DI binding.

### Storage
- **Current MVP**: MinIO (Local)
- **Future Enterprise**: AWS S3
- **Environment Variables**: `STORAGE_ENDPOINT`, `STORAGE_BUCKET`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`
- **Fallback Strategy**: CDN caching.
- **Migration Strategy**: MinIO is S3-compatible; zero code changes required, only env updates.

### Maps
- **Current MVP**: OSRM (Open Source Routing Machine)
- **Future Enterprise**: Google Maps API
- **Environment Variables**: `MAPS_PROVIDER`, `MAPS_API_KEY`
- **Fallback Strategy**: Aerial distance calculation if routing fails.
- **Migration Strategy**: Switch from `OsrmProvider` to `GoogleMapsProvider`.

### Payment
- **Current MVP**: Razorpay
- **Future Enterprise**: Stripe (Multi-country)
- **Environment Variables**: `PAYMENT_GATEWAY`, `PAYMENT_KEY_ID`, `PAYMENT_KEY_SECRET`
- **Fallback Strategy**: Retry captures.
- **Migration Strategy**: Switch from `RazorpayProvider` to `StripeProvider` under `IPaymentProvider`.

### SMS
- **Current MVP**: Twilio
- **Future Enterprise**: Gupshup / AWS SNS
- **Environment Variables**: `SMS_PROVIDER`, `SMS_API_KEY`
- **Fallback Strategy**: Fallback to Push Notification if SMS fails.
- **Migration Strategy**: Switch DI token based on `SMS_PROVIDER`.

### Push
- **Current MVP**: Firebase Cloud Messaging (FCM)
- **Future Enterprise**: FCM
- **Environment Variables**: `FCM_SERVER_KEY`
- **Fallback Strategy**: In-app notifications pool.
- **Migration Strategy**: Standardized behind `IPushProvider`.

### Authentication
- **Current MVP**: Local JWT + DB Sessions
- **Future Enterprise**: Auth0 / AWS Cognito
- **Environment Variables**: `AUTH_PROVIDER`, `JWT_SECRET`, `JWT_EXPIRES_IN`
- **Fallback Strategy**: N/A.
- **Migration Strategy**: JWT verification delegated to `IAuthProvider`.

### Email
- **Current MVP**: SendGrid
- **Future Enterprise**: AWS SES
- **Environment Variables**: `EMAIL_PROVIDER`, `EMAIL_API_KEY`
- **Fallback Strategy**: Queue emails for retry.
- **Migration Strategy**: Switch DI token.

### Feature Flags
- **Current MVP**: Database-backed feature flags
- **Future Enterprise**: LaunchDarkly
- **Environment Variables**: `FEATURE_FLAG_PROVIDER`
- **Fallback Strategy**: Cache fallback if provider is down. Default to safe state (flags off).
- **Migration Strategy**: Implement `LaunchDarklyProvider` implementing `IFeatureFlagProvider`.
