/** IFeatureFlagProvider is an exported domains/configuration contract/implementation; see the owning README for lifecycle and extension rules. */
export interface IFeatureFlagProvider {
  isEnabled(key: string): Promise<boolean>;
  getAllFlags(): Promise<Record<string, boolean>>;
}
