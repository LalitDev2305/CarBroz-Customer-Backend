import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetInitConfigUseCase } from '../src/modules/config/use-cases/GetInitConfigUseCase.js';
import { type IConfigProvider } from '@carbroz/foundation-kernel';
import { type IFeatureFlagProvider } from '@carbroz/domain-configuration';

describe('GetInitConfigUseCase', () => {
  let configProvider: IConfigProvider;
  let featureFlagProvider: IFeatureFlagProvider;
  let useCase: GetInitConfigUseCase;

  beforeEach(() => {
    configProvider = {
      get: vi.fn(),
      has: vi.fn(),
      getAll: vi.fn(),
    } as unknown as IConfigProvider;

    featureFlagProvider = {
      isEnabled: vi.fn(),
      getAllFlags: vi.fn(),
    } as unknown as IFeatureFlagProvider;

    useCase = new GetInitConfigUseCase(configProvider, featureFlagProvider);
  });

  it('should return combined configuration correctly', async () => {
    (configProvider.get as any).mockImplementation((key: string) => {
      const store: Record<string, string> = {
        'maintenance.enabled': 'true',
        'maintenance.message': 'Test maintenance',
        'android.minVersion': '1.0.0',
        'android.latestVersion': '1.0.1',
        'ios.minVersion': '2.0.0',
        'ios.latestVersion': '2.0.1',
      };
      return store[key];
    });

    (featureFlagProvider.getAllFlags as any).mockResolvedValue({
      wallet: true,
      subscriptions: false
    });

    const result = await useCase.execute();

    expect(result).toEqual({
      maintenance: {
        enabled: true,
        message: 'Test maintenance'
      },
      forceUpdate: {
        android: {
          minVersion: '1.0.0',
          latestVersion: '1.0.1'
        },
        ios: {
          minVersion: '2.0.0',
          latestVersion: '2.0.1'
        }
      },
      featureFlags: {
        wallet: true,
        subscriptions: false
      }
    });
  });
});
