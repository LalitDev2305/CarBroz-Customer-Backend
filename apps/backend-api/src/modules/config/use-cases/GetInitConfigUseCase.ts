import { IConfigProvider, IFeatureFlagProvider } from '@carbroz/common';
import { InitConfigResponseDto } from '../dtos/config.dto.js';

export class GetInitConfigUseCase {
  private configProvider: IConfigProvider;
  private featureFlagProvider: IFeatureFlagProvider;

  constructor(
    configProvider: IConfigProvider,
    featureFlagProvider: IFeatureFlagProvider
  ) {
    this.configProvider = configProvider;
    this.featureFlagProvider = featureFlagProvider;
  }

  public async execute(): Promise<InitConfigResponseDto> {
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
        android: {
          minVersion: androidMin,
          latestVersion: androidLatest,
        },
        ios: {
          minVersion: iosMin,
          latestVersion: iosLatest,
        },
      },
      featureFlags,
    };
  }
}
