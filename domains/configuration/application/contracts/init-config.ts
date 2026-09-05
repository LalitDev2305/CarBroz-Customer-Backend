/** Product maintenance state returned by Configuration application services. */
export interface MaintenanceConfig {
  readonly enabled: boolean;
  readonly message: string;
}

/** Supported and latest application versions for one client platform. */
export interface ForceUpdateVersionConfig {
  readonly minVersion: string;
  readonly latestVersion: string;
}

/** Version policy for supported mobile client platforms. */
export interface ForceUpdateConfig {
  readonly android: ForceUpdateVersionConfig;
  readonly ios: ForceUpdateVersionConfig;
}

/** Immutable snapshot of evaluated feature flags. */
export type FeatureFlagSnapshot = Readonly<Record<string, boolean>>;

/** Transport-neutral startup destination owned by Configuration. */
export interface StartupRouteConfig {
  readonly destination: string;
  readonly api: string;
}

/** Startup routing policy for anonymous and authenticated clients. */
export interface StartupRoutingConfig {
  readonly guest: StartupRouteConfig;
  readonly authenticated: StartupRouteConfig;
}

/**
 * Transport-neutral startup configuration produced by the Configuration bounded context.
 * API surfaces may map this shape to their own DTOs, but Configuration never imports transport DTOs.
 */
export interface InitConfigSnapshot {
  readonly maintenance: MaintenanceConfig;
  readonly forceUpdate: ForceUpdateConfig;
  readonly featureFlags: FeatureFlagSnapshot;
  readonly startupRouting: StartupRoutingConfig;
}
