# 07 — Canonical Feature Module Directory Template

Every business capability feature (e.g. `features/booking/`) strictly adheres to this standard 5-layer internal folder structure:

```
features/<feature_name>/
├── domain/                                # PURE DOMAIN LAYER
│   ├── models/                            # Aggregate roots & entities (e.g., Booking.ts)
│   ├── value-objects/                     # Feature-specific VOs
│   ├── repositories/                      # Repository interface contracts (e.g., IBookingRepository.ts)
│   └── services/                          # Pure domain calculation services
│
├── application/                           # APPLICATION USE CASE LAYER
│   ├── dtos/                              # Zod schemas & TypeScript DTOs (e.g., booking.dto.ts)
│   └── use-cases/                         # Business use cases (e.g., CreateBookingUseCase.ts)
│
├── infrastructure/                        # PERSISTENCE & ADAPTERS
│   └── repositories/                      # Concrete Prisma implementations (e.g., PrismaBookingRepository.ts)
│
├── delivery/                              # HTTP REST DELIVERY SURFACES
│   ├── customer/                          # Customer REST controllers & routes
│   │   ├── CustomerBookingController.ts
│   │   └── customer-booking.routes.ts
│   ├── partner/                           # Partner REST controllers & routes
│   │   ├── PartnerBookingController.ts
│   │   └── partner-booking.routes.ts
│   └── admin/                             # Admin REST controllers & routes
│       ├── AdminBookingController.ts
│       └── admin-booking.routes.ts
│
├── ui/                                    # FEATURE SDUI BUILDERS
│   ├── customer/                          # Customer SDUI builders (e.g., SlotSelectionBuilder.ts)
│   ├── partner/                           # Partner SDUI builders
│   └── corporate/                         # Corporate SDUI builders
│
├── tests/                                 # FEATURE TEST SUITE
│   ├── domain/                            # Unit tests for domain models
│   ├── use-cases/                         # Integration tests for use cases
│   └── ui/                                # SDUI builder layout tests
│
├── index.ts                               # Feature Public API Barrel Export
└── <feature>.module.ts                    # Awilix DI Self-Registration Block
```
