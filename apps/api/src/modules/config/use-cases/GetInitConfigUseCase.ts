import type {
  IConfigProvider,
  IFeatureFlagProvider,
  InitConfigSnapshot,
} from '@carbroz/domain-configuration';

/**
 * Builds the transport-neutral application bootstrap configuration owned by Configuration.
 * HTTP DTOs, response wrappers and validation schemas remain transport concerns.
 */
export class GetInitConfigUseCase {
  constructor(
    private readonly configProvider: IConfigProvider,
    private readonly featureFlagProvider: IFeatureFlagProvider,
  ) {}

  async execute(): Promise<InitConfigSnapshot> {
    const [
      maintenanceEnabled,
      maintenanceMessage,
      androidMin,
      androidLatest,
      iosMin,
      iosLatest,
      featureFlags,
    ] = await Promise.all([
      this.configProvider.get<string>('maintenance.enabled', 'false'),
      this.configProvider.get<string>('maintenance.message', ''),
      this.configProvider.get<string>('android.minVersion', '1.0.0'),
      this.configProvider.get<string>('android.latestVersion', '1.0.0'),
      this.configProvider.get<string>('ios.minVersion', '1.0.0'),
      this.configProvider.get<string>('ios.latestVersion', '1.0.0'),
      this.featureFlagProvider.getAllFlags(),
    ]);

    return {
      maintenance: {
        enabled: maintenanceEnabled === 'true',
        message: maintenanceMessage,
      },
      forceUpdate: {
        android: { minVersion: androidMin, latestVersion: androidLatest },
        ios: { minVersion: iosMin, latestVersion: iosLatest },
      },
      featureFlags,
    };
  }
}
