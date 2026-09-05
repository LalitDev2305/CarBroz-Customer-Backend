import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  GetInitConfigUseCase,
  type IConfigProvider,
  type IFeatureFlagProvider,
} from '@carbroz/domain-configuration';

describe('GetInitConfigUseCase', () => {
  let configProvider: IConfigProvider;
  let featureFlagProvider: IFeatureFlagProvider;
  let useCase: GetInitConfigUseCase;

  beforeEach(() => {
    configProvider = {
      get: vi.fn(),
      has: vi.fn(),
      getAll: vi.fn(),
    };

    featureFlagProvider = {
      isEnabled: vi.fn(),
      getAllFlags: vi.fn(),
    };

    useCase = new GetInitConfigUseCase(configProvider, featureFlagProvider);
  });

  it('returns the complete persisted bootstrap snapshot for frontend startup', async () => {
    vi.mocked(configProvider.get).mockImplementation(async (key: string, defaultValue?: unknown) => {
      const store: Record<string, string> = {
        'maintenance.enabled': 'true',
        'maintenance.message': 'Test maintenance',
        'android.minVersion': '1.0.0',
        'android.latestVersion': '1.0.1',
        'ios.minVersion': '2.0.0',
        'ios.latestVersion': '2.0.1',
        'startup.guest.destination': 'auth_template',
        'startup.guest.api': 'auth/auth_login',
        'startup.authenticated.destination': 'dashboard_template',
        'startup.authenticated.api': 'dashboard/home',
      };
      return (store[key] ?? defaultValue) as never;
    });

    vi.mocked(featureFlagProvider.getAllFlags).mockResolvedValue({
      wallet: true,
      subscriptions: false,
    });

    await expect(useCase.execute()).resolves.toEqual({
      maintenance: {
        enabled: true,
        message: 'Test maintenance',
      },
      forceUpdate: {
        android: {
          minVersion: '1.0.0',
          latestVersion: '1.0.1',
        },
        ios: {
          minVersion: '2.0.0',
          latestVersion: '2.0.1',
        },
      },
      featureFlags: {
        wallet: true,
        subscriptions: false,
      },
      startupRouting: {
        guest: {
          destination: 'auth_template',
          api: 'auth/auth_login',
        },
        authenticated: {
          destination: 'dashboard_template',
          api: 'dashboard/home',
        },
      },
    });
  });

  it('uses safe startup defaults when the database does not override bootstrap values', async () => {
    vi.mocked(configProvider.get).mockImplementation(async (_key: string, defaultValue?: unknown) => defaultValue as never);
    vi.mocked(featureFlagProvider.getAllFlags).mockResolvedValue({});

    await expect(useCase.execute()).resolves.toMatchObject({
      maintenance: { enabled: false, message: '' },
      forceUpdate: {
        android: { minVersion: '1.0.0', latestVersion: '1.0.0' },
        ios: { minVersion: '1.0.0', latestVersion: '1.0.0' },
      },
      featureFlags: {},
      startupRouting: {
        guest: { destination: 'auth_template', api: 'auth/auth_login' },
        authenticated: { destination: 'dashboard_template', api: 'dashboard/home' },
      },
    });
  });
});
