import type { IConfigProvider } from '../IConfigProvider.js';
import type { IFeatureFlagProvider } from '../IFeatureFlagProvider.js';
import type { InitConfigSnapshot } from '../contracts/init-config.js';

/**
 * Builds the transport-neutral application bootstrap configuration owned by Configuration.
 * All values are persisted/runtime-configurable with safe defaults for a fresh environment.
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
      guestDestination,
      guestApi,
      authenticatedDestination,
      authenticatedApi,
      featureFlags,
    ] = await Promise.all([
      this.configProvider.get<string>('maintenance.enabled', 'false'),
      this.configProvider.get<string>('maintenance.message', ''),
      this.configProvider.get<string>('android.minVersion', '1.0.0'),
      this.configProvider.get<string>('android.latestVersion', '1.0.0'),
      this.configProvider.get<string>('ios.minVersion', '1.0.0'),
      this.configProvider.get<string>('ios.latestVersion', '1.0.0'),
      this.configProvider.get<string>('startup.guest.destination', 'auth_template'),
      this.configProvider.get<string>('startup.guest.api', 'auth/auth_login'),
      this.configProvider.get<string>('startup.authenticated.destination', 'dashboard_template'),
      this.configProvider.get<string>('startup.authenticated.api', 'dashboard/home'),
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
      startupRouting: {
        guest: { destination: guestDestination, api: guestApi },
        authenticated: { destination: authenticatedDestination, api: authenticatedApi },
      },
    };
  }
}
