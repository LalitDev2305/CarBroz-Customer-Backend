/** MaintenanceDto is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export interface MaintenanceDto {
  enabled: boolean;
  message: string;
}

/** ForceUpdateVersionDto is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export interface ForceUpdateVersionDto {
  minVersion: string;
  latestVersion: string;
}

/** ForceUpdateDto is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export interface ForceUpdateDto {
  android: ForceUpdateVersionDto;
  ios: ForceUpdateVersionDto;
}

/** FeatureFlagsDto is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export interface FeatureFlagsDto {
  [key: string]: boolean;
}

/** InitConfigResponseDto is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export interface InitConfigResponseDto {
  maintenance: MaintenanceDto;
  forceUpdate: ForceUpdateDto;
  featureFlags: FeatureFlagsDto;
}
