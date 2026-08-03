# Phase 9: Maps & Geocoding Implementation Plan

## 1. Objectives
- Abstract all external mapping and geolocation services behind a strict `IMapsProvider` interface.
- Provide a robust way to perform forward geocoding, reverse geocoding, and distance matrix calculations.
- Introduce application-layer Use Cases and a REST API for clients to interact with map functionalities.

## 2. Scope
### Included
- Domain models for Coordinates, Address, and Distance.
- Provider interface `IMapsProvider`.
- A concrete `GoogleMapsProvider` (or generic `HttpMapsProvider`) implementation.
- API Endpoints to consume map services.
- Tests, DI Registration, and validation.

### Explicitly NOT in Scope
- Persistent storage of addresses (Database changes are reserved for Phase 10 and 11).
- Partner geospatial availability (Redis GeoHash logic belongs to Phase 17).
- Complex route optimization or dispatch algorithms (Phase 20).
- Frontend UI mapping components.

## 3. Domain Models
**`packages/common/src/domain/models/Location.ts`**
- `Coordinates` (latitude: number, longitude: number)
- `AddressComponent` (street, city, state, country, postalCode)
- `GeocodeResult`
- `DistanceMatrixResult` (distanceInMeters, durationInSeconds)

## 4. Database Changes
- **None**: Phase 9 strictly deals with external API abstraction.

## 5. Repository Interfaces
- **None**: No direct persistence needed.

## 6. Repository Implementations
- **None**: No direct persistence needed.

## 7. Providers
**`packages/common/src/domain/providers/IMapsProvider.ts`**
- `geocode(address: string): Promise<GeocodeResult>`
- `reverseGeocode(coordinates: Coordinates): Promise<GeocodeResult>`
- `calculateDistance(origin: Coordinates, destination: Coordinates): Promise<DistanceMatrixResult>`

**`packages/providers/src/maps/GoogleMapsProvider.ts`**
- Concrete implementation using REST APIs (with fallback/mock handling for local dev without API keys).

## 8. Use Cases
**`apps/backend-api/src/modules/maps/use-cases/`**
1. `GeocodeAddressUseCase`
2. `ReverseGeocodeUseCase`
3. `CalculateDistanceUseCase`

## 9. Controllers & Routes
**`apps/backend-api/src/modules/maps/api/maps.controller.ts`**
- Resolves UseCases from `request.diScope`.
- Validates query params using DTO schemas.

**`apps/backend-api/src/modules/maps/api/maps.routes.ts`**
- `GET /api/v1/maps/geocode`
- `GET /api/v1/maps/reverse-geocode`
- `GET /api/v1/maps/distance`
- Requires authentication via `fastify.authenticate`.

## 10. DTOs (Zod)
**`apps/backend-api/src/modules/maps/dtos/maps.dto.ts`**
- `geocodeSchema`
- `reverseGeocodeSchema`
- `calculateDistanceSchema`

## 11. DI Registrations
**`apps/backend-api/src/container/index.ts`**
- `mapsProvider: asClass(GoogleMapsProvider).singleton()`
- `geocodeAddressUseCase: asClass(GeocodeAddressUseCase).scoped()`
- `reverseGeocodeUseCase: asClass(ReverseGeocodeUseCase).scoped()`
- `calculateDistanceUseCase: asClass(CalculateDistanceUseCase).scoped()`

## 12. API Endpoints

### 12.1 Forward Geocode
`GET /api/v1/maps/geocode?address={string}`
**Response**: `GeocodeResult`

### 12.2 Reverse Geocode
`GET /api/v1/maps/reverse-geocode?lat={number}&lng={number}`
**Response**: `GeocodeResult`

### 12.3 Calculate Distance
`GET /api/v1/maps/distance?originLat={number}&originLng={number}&destLat={number}&destLng={number}`
**Response**: `DistanceMatrixResult`

## 13. Tests
- **Unit Tests**: Mock `IMapsProvider` and test all Use Cases.
- **Provider Tests**: Test `GoogleMapsProvider` with mocked HTTP requests (e.g. `nock` or `fetch` mocking).
- **E2E/API Tests**: Mount `maps.routes.ts` in Vitest and verify HTTP responses and Zod validation errors.

## 14. Documentation Updates
- Update `PROJECT_STATUS.md` to IN_PROGRESS for Phase 9.
- Generate `release_notes.md` and `walkthrough.md`.

## 15. Risks
- **External API Rate Limits**: Depending on the chosen Maps provider, un-cached queries may exhaust rate limits. *(Mitigation: Implement basic caching or document future caching strategy)*.
- **Cost**: Real Map APIs cost money. *(Mitigation: Provider will include a development fallback/mock mode when `MAPS_API_KEY` is missing).*

## 16. Verification Checklist
- [ ] `IMapsProvider` interface defined in `@carbroz/common`.
- [ ] `GoogleMapsProvider` implemented in `@carbroz/providers`.
- [ ] Maps Use Cases fully implemented.
- [ ] API endpoints returning successful HTTP 200 responses.
- [ ] Zod schema validation correctly parsing lat/lng strings to numbers.
- [ ] All 50+ existing tests and new map tests pass.

## 17. Files to Create
- `packages/common/src/domain/models/Location.ts`
- `packages/common/src/domain/providers/IMapsProvider.ts`
- `packages/providers/src/maps/GoogleMapsProvider.ts`
- `packages/providers/tests/GoogleMapsProvider.spec.ts`
- `apps/backend-api/src/modules/maps/api/maps.controller.ts`
- `apps/backend-api/src/modules/maps/api/maps.routes.ts`
- `apps/backend-api/src/modules/maps/dtos/maps.dto.ts`
- `apps/backend-api/src/modules/maps/use-cases/GeocodeAddressUseCase.ts`
- `apps/backend-api/src/modules/maps/use-cases/ReverseGeocodeUseCase.ts`
- `apps/backend-api/src/modules/maps/use-cases/CalculateDistanceUseCase.ts`
- `apps/backend-api/src/modules/maps/use-cases/*.spec.ts`

## 18. Files to Modify
- `packages/common/src/index.ts` (Export models/providers)
- `packages/providers/src/index.ts`
- `apps/backend-api/src/container/index.ts`
- `apps/backend-api/src/app.ts` (Register maps routes)
