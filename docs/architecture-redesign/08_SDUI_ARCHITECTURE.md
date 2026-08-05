# 08 — Final SDUI Architecture & Feature Ownership

## Executive Summary
This document establishes the final architecture for Server-Driven UI (SDUI) in CarBroz, strictly enforcing domain independence in `@carbroz/ui-sdk` while co-locating concrete screen builders inside their respective feature modules.

---

## 1. SDUI Responsibility Division

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    @carbroz/ui-sdk (PURE UI SDK)                        │
│  - ScreenFactory (Single Runtime Registry)                              │
│  - BaseScreenBuilder (Abstract Base Class)                              │
│  - Node Primitives (BaseTemplate, GenericComponent, Subcomponent, Child)│
│  - UI DSL Helper (UI.component(), UI.child(), UI.childrenData())        │
│  - Schema Validators (ui.schemas.ts) & Serializers                      │
│  - Zero knowledge of CarBroz business domains                          │
└────────────────────────────────────▲────────────────────────────────────┘
                                     │ (Extends & Uses Primitives)
                                     │
┌────────────────────────────────────┴────────────────────────────────────┐
│                    FEATURE MODULE CONCRETE SDUI BUILDERS                │
│                                                                         │
│  features/auth/ui/               -> AuthLoginBuilder, AuthOtpBuilder    │
│  features/catalog/ui/            -> SearchBuilder, ServiceDetailBuilder │
│  features/vehicle/ui/            -> GarageBuilder, VehicleBuilder       │
│  features/customer/ui/           -> AddressBuilder, ProfileBuilder      │
│  features/booking/ui/            -> SlotSelectionBuilder, ActiveBooking │
│  features/corporate/ui/          -> CorporateBookingBuilder             │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Locked JSON Hierarchy Enforcement
Every feature builder emits JSON adhering strictly to `04_DYNAMIC_UI_SPECIFICATION.md`:
```
Screen
  └── Template
        └── Component[]
              └── Subcomponent[]
                    └── Child[]
                          └── ChildrenData[]
```
- Root-level `theme` property.
- Zero recursive nesting.
- Dynamic runtime data hydration provided by domain use cases before layout serialization.
