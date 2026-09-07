export type PartnerClientPlatform = 'ANDROID' | 'IOS' | 'DESKTOP';
export type PartnerStartupAuthentication = 'NONE' | 'SESSION';

/** Inputs required to evaluate Partner app startup configuration. */
export interface PartnerBootstrapRequest {
  readonly platform: PartnerClientPlatform;
  readonly appVersion: string;
  readonly authenticated: boolean;
}

/** Maintenance policy owned by the Partner bootstrap configuration document. */
export interface PartnerMaintenanceConfig {
  readonly enabled: boolean;
  readonly title: string | null;
  readonly message: string | null;
}

/** Per-platform version policy stored in Partner configuration. */
export interface PartnerPlatformUpdateConfig {
  readonly minimumVersion: string;
  readonly latestVersion: string;
  readonly storeUrl: string | null;
}

/** Small set of app-wide Partner capability switches safe to evaluate at startup. */
export interface PartnerFeatureConfig {
  readonly registrationEnabled: boolean;
  readonly individualPartnerEnabled: boolean;
  readonly organizationPartnerEnabled: boolean;
}

/** SDUI destination selected by Partner startup policy. */
export interface PartnerStartupScreenConfig {
  readonly screenId: string;
  readonly templateId: string;
  readonly templateType: string;
  readonly endpoint: string;
  readonly method: 'GET';
  readonly authentication: PartnerStartupAuthentication;
}

/**
 * Atomic persisted Partner startup document stored under the `partner.bootstrap` configuration key.
 * Product/business workflow data does not belong here.
 */
export interface PartnerBootstrapDocument {
  readonly version: string;
  readonly maintenance: PartnerMaintenanceConfig;
  readonly update: Readonly<Record<PartnerClientPlatform, PartnerPlatformUpdateConfig>>;
  readonly features: PartnerFeatureConfig;
  readonly startup: {
    readonly guest: PartnerStartupScreenConfig;
    readonly authenticated: PartnerStartupScreenConfig;
  };
}

/** Evaluated update policy returned to the Partner application. */
export interface PartnerEvaluatedUpdateConfig extends PartnerPlatformUpdateConfig {
  readonly required: boolean;
  readonly optional: boolean;
}

/** Transport-neutral Partner bootstrap result produced by Configuration. */
export interface PartnerBootstrapSnapshot {
  readonly config: {
    readonly version: string;
    readonly maintenance: PartnerMaintenanceConfig;
    readonly update: PartnerEvaluatedUpdateConfig;
    readonly features: PartnerFeatureConfig;
  };
  readonly startup: {
    readonly authenticated: boolean;
    readonly nextScreen: PartnerStartupScreenConfig;
  };
}
