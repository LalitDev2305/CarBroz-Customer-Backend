# Phase 12 Release Notes: Catalog & Dynamic Pricing Engine

## Overview
Phase 12 introduces the core Service Catalog and Dynamic Pricing Engine to the CarBroz Backend Platform, providing structured service categories, service definitions, add-on options, and dynamic price calculations incorporating vehicle type multipliers.

## Key Accomplishments
1. **Database Schema Enhancements**:
   - `ServiceCategory`: Groups services with display order, icons, and slug routing.
   - `Service`: Base services with duration, base price (in cents), and media URLs.
   - `ServiceAddon`: Optional service enhancements with individual pricing.
   - `PricingTier`: Flat pricing overrides and custom service tiers.
   - `VehicleTypeMultiplier`: Dynamic price multiplier per vehicle class (Hatchback, Sedan, SUV, Luxury).
2. **Clean Architecture & Repository Pattern**:
   - `ICatalogRepository` & `IPricingRepository` domain interfaces in `@carbroz/common`.
   - `PrismaCatalogRepository` & `PrismaPricingRepository` implementations in `@carbroz/database`.
3. **Use Cases**:
   - `GetCatalogUseCase`: Aggregates active categories and services for customer applications.
   - `CalculateServicePriceUseCase`: Computes exact pricing based on base rate, vehicle multiplier, and selected add-ons.
   - `ManageCatalogUseCase`: Administrative creation and updates for categories, services, and add-ons.
   - `ManagePricingTierUseCase`: Administrative configuration for base tiers and vehicle multipliers.
4. **API Endpoints**:
   - Public/Customer Catalog: `/api/v1/catalog` (GET catalog, POST price calculation).
   - Admin Catalog: `/api/v1/admin/catalog` (Category, service, add-on, tier & multiplier creation).
5. **Testing & Parity**:
   - Full unit test suite covering price calculation, vehicle multipliers, and admin validation rules.
