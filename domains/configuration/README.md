# Configuration Domain (`domains/configuration/`)

> **Status:** ACTIVE  
> **Package:** `@carbroz/domain-configuration`  
> **Architecture authority:** `docs/MASTER-BACKEND-CONSTITUTION.md` and the current Partner bootstrap/SDUI contracts.

Configuration owns persisted runtime/product configuration and startup decisions. It does **not** own SDUI structure, authentication policy, OTP persistence, Partner business state, provider secrets, database configuration, or HTTP framework behavior.

## 1. Partner bootstrap responsibility

Current Partner bootstrap endpoint:

```http
GET /api/v1/partner/bootstrap
```

Persisted configuration key:

```text
partner.bootstrap
```

The Configuration use case decides:

- maintenance state;
- update requirement/optional update;
- enabled Partner startup features;
- guest versus authenticated startup destination.

The transport layer validates request headers/authentication state and maps the result into the common HTTP response envelope.

## 2. Current startup destinations

### Guest -> Login

The built-in fallback is:

```json
{
  "screenId": "partner_login",
  "templateId": "tpl_7K2M9Q",
  "templateType": "stack_template",
  "endpoint": "/api/v1/partner/screen/auth_login",
  "method": "GET",
  "authentication": "NONE"
}
```

The actual Login SDUI document is composed only by:

```text
sdui/engine/src/screens/partner/PartnerLoginScreen.ts
```

Configuration owns only the startup destination data; it must not duplicate the Login screen definition.

### Authenticated -> Dashboard

The current built-in authenticated destination is:

```json
{
  "screenId": "partner_dashboard",
  "templateId": "partner_dashboard_template",
  "templateType": "default_template",
  "endpoint": "/api/v1/partner/sdui/registry/partner_dashboard",
  "method": "GET",
  "authentication": "SESSION"
}
```

The registry-backed endpoint is retained because the standalone SDUI Registry still owns persisted published-screen lifecycle/version resolution. That does not make Configuration or the Registry a second screen-composition authority.

## 3. Ownership boundaries

```text
HTTP headers / route / response envelope
    -> apps/api Partner surface

startup/update/maintenance configuration
    -> domains/configuration

Login / OTP business authentication behavior
    -> domains/identity

OTP challenge persistence/provider integration
    -> Identity port + platform integration

SDUI language / definitions / validation / screen composition
    -> sdui/engine

persisted SDUI draft/publish/version/history lifecycle
    -> sdui/registry
```

Configuration must remain transport-neutral. It must not read Fastify requests directly and must not import Partner SDUI builders or engine internals merely to decide the next destination.

## 4. Core implementation

```text
domains/configuration/
├── application/
│   ├── contracts/partner-bootstrap.ts
│   ├── ConfigProvider.ts
│   ├── IConfigProvider.ts
│   └── use-cases/GetPartnerBootstrapUseCase.ts
├── infrastructure/
│   └── repositories/PrismaConfigRepository.ts
├── tests/
│   ├── ConfigProvider.spec.ts
│   ├── FeatureFlagProvider.spec.ts
│   └── GetPartnerBootstrapUseCase.spec.ts
├── config.module.ts
└── README.md
```

Partner HTTP adaptation is owned by:

```text
apps/api/src/surfaces/partner/controllers/partner.bootstrap.controller.ts
apps/api/src/surfaces/partner/routes/partner.bootstrap.routes.ts
apps/api/src/surfaces/partner/dto/partner.bootstrap.dto.ts
```

## 5. Persistence rule

`ConfigProvider` reads the persisted `partner.bootstrap` document or uses the built-in default. Persisted JSON is not assumed to receive new required fields automatically.

When the persisted contract changes, explicitly consider:

- schema/contract compatibility;
- existing stored documents;
- default fallback behavior;
- older frontend versions;
- migration/normalization where required.

Do not silently deep-merge an old persisted document into a new required contract unless that behavior is deliberately designed and tested.

## 6. Validation rules

The bootstrap use case must reject malformed configuration rather than route clients using invalid data. Tests must cover at least:

- missing/invalid bootstrap document;
- missing platform update configuration;
- invalid application-version syntax;
- latest version below minimum version;
- missing/invalid guest destination;
- missing/invalid authenticated destination;
- unsafe/non-relative startup endpoints;
- required/optional/no-update decisions;
- guest and authenticated destination selection;
- persisted configuration and default fallback behavior.

## 7. Focused freeze rule

For the current Configuration/Login/OTP/SDUI freeze:

- do not add unrelated Partner lifecycle data to bootstrap;
- do not move Login/OTP business policy into Configuration;
- do not move SDUI composition into Configuration;
- keep the guest Login destination synchronized with the frozen engine Login identity;
- keep authenticated registry routing only while persisted lifecycle resolution remains required;
- changes must pass focused Configuration tests, related Partner bootstrap transport tests, architecture gates, build and lint.
