# Foundation Kernel (`@carbroz/foundation-kernel`)

## Purpose

Foundation Kernel is the single owner of truly universal, domain-independent primitives used across CarBroz Backend V3. It exists to provide a very small stable dependency base without becoming a business `common` or `shared` package.

The Master Constitution is authoritative. If a concept has CarBroz business meaning, vendor meaning, transport meaning or SDUI-specific meaning, it does not belong here merely because several modules use it.

## Owns

Foundation may own universal concepts such as:

- Entity/AggregateRoot/ValueObject primitives;
- DomainEvent and Result primitives;
- universal repository abstractions where justified;
- Money and other genuinely universal value primitives;
- universal application/use-case contracts;
- universal error primitives;
- clock, ID, actor identity, pagination and transaction contracts when they are domain-independent.

## Does not own

Foundation must never own:

- User, Customer, Partner, Booking, Payment, Coupon, Review, Address or KYC concepts;
- SDUI Screen/Template/Component/Section/Group/Element contracts;
- Fastify requests/replies, HTTP middleware or API response presentation;
- Prisma implementations;
- Redis, queues, storage or vendor SDK implementations;
- Firebase, Razorpay, Google Maps, SMS/email/push provider models;
- product-specific authorization or workflow rules.

## Inbound consumers

Canonical domains, SDUI packages, Platform capabilities and the API composition/transport layer may depend on Foundation when they require a universal primitive.

Foundation must not depend back on those consumers.

## Dependency direction

```text
apps / domains / sdui / platform
              |
              v
       foundation/kernel
```

Forbidden:

```text
foundation -> apps
foundation -> business domains
foundation -> sdui
foundation -> platform implementations
```

## Error model

`KernelError` is the universal typed error primitive. `ApplicationError` adds the stable `errorCode` shape required while application failures cross into transport mapping. Specialized generic errors such as `ForbiddenError`, `NotFoundError` and `ConflictError` are Foundation-owned because they carry no CarBroz-specific business semantics.

`packages/common` temporarily re-exports the same constructors during migration. It must not define a second error hierarchy. New code imports directly from `@carbroz/foundation-kernel`.

Domain-specific errors remain in their owning bounded context and may extend a suitable Foundation primitive when useful.

## Request-context boundary

Transport request context is not automatically a Foundation concept. Fastify/request IDs, tracing spans, locale, guest/authenticated request records and other HTTP/runtime details remain API/transport concerns unless a narrower universal contract is intentionally extracted.

Do not move a legacy object into Foundation simply to remove `packages/common`.

## Extension rule

Add a new Foundation primitive only when all of these are true:

1. it is genuinely domain-independent;
2. more than one architectural category can use it without learning another category's internals;
3. it does not encode a vendor/transport/business concern;
4. its ownership can be explained without using `common`, `shared`, `helper` or `utils` reasoning.

Otherwise place the concept in its real domain, SDUI, Platform or API owner.

## Testing

Foundation tests protect primitive invariants and compatibility contracts. Architecture tests must additionally ensure Foundation never acquires forbidden outward dependencies and that transitional compatibility exports preserve constructor identity until migration cleanup removes them.
