import { IConfigProvider, IFeatureFlagProvider } from '@carbroz/common';

export interface InitConfigResult {
  maintenance: {
    enabled: boolean;
    message: string;
  };
  forceUpdate: {
    android: {
      minVersion: string;
      latestVersion: string;
    };
    ios: {
      minVersion: string;
      latestVersion: string;
    };
  };
  featureFlags: Record<string, boolean>;
}

/**
 * Builds the transport-neutral application bootstrap configuration consumed by API surfaces.
 *
 * Configuration owns the meaning and defaults of configuration keys and feature flags. HTTP DTOs,
 * response wrappers and validation schemas remain transport concerns and must not be imported here.
 */
export class GetInitConfigUseCase {
  constructor(
    private readonly configProvider: IConfigProvider,
    private readonly featureFlagProvider: IFeatureFlagProvider,
  ) {}

  public async execute(): Promise<InitConfigResult> {
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
