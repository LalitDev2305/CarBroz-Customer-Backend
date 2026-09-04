export interface IFeatureFlagProvider {
  isEnabled(key: string): Promise<boolean>;
  getAllFlags(): Promise<Record<string, boolean>>;
}
