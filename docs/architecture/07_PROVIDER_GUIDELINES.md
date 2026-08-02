---
Version: 1.0.0
Status: FROZEN
Owner: CarBroz Architecture Team
Last Updated: 2026-08-02
---

# 07 Provider Guidelines

## The Provider Pattern
To ensure future scalability and decoupling from third-party services, all infrastructural logic must use the Provider Pattern.

## How to Add or Replace a Provider
1. **Interface Definition**: Define an interface in the domain (e.g., `interface IPaymentProvider { capture(amount: number): Promise<string> }`).
2. **Implementation**: Implement the interface in the infrastructure layer (e.g., `RazorpayProvider implements IPaymentProvider`).
3. **Dependency Injection**: Bind the interface to the concrete class in the DI container. The DI container injects the provider where needed without exposing the implementation.
4. **Environment Mapping**: Registration is based on environment variables. To replace a provider (e.g., switch from MinIO to S3), create the `S3Provider`, map it to `IStorageProvider`, and update the `.env` variable `STORAGE_PROVIDER=S3`. The DI container handles the rest. No domain code changes are required.

## Standardized Providers
- **Database Provider**: Exposes repository patterns over Prisma.
- **Cache Provider**: Abstracts Redis operations (Set, Get, TTL).
- **Queue Provider**: Abstracts BullMQ job pushing and processing.
- **Storage Provider**: MinIO / S3 for image uploads.
- **Maps Provider**: Google Maps / OSRM for dispatch matrix.
- **Payment Provider**: Razorpay / Stripe for financial txns.
- **Notification Provider**: Firebase (Push) / Twilio (SMS).
- **Authentication Provider**: JWT signing, verification, and rotation.
