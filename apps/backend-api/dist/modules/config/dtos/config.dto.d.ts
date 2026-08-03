export interface MaintenanceDto {
    enabled: boolean;
    message: string;
}
export interface ForceUpdateVersionDto {
    minVersion: string;
    latestVersion: string;
}
export interface ForceUpdateDto {
    android: ForceUpdateVersionDto;
    ios: ForceUpdateVersionDto;
}
export interface FeatureFlagsDto {
    [key: string]: boolean;
}
export interface InitConfigResponseDto {
    maintenance: MaintenanceDto;
    forceUpdate: ForceUpdateDto;
    featureFlags: FeatureFlagsDto;
}
