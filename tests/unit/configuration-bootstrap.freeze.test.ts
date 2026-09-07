import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ConfigProvider,
  GetInitConfigUseCase,
  type IConfigProvider,
  type IConfigRepository,
  type IFeatureFlagProvider,
} from '@carbroz/domain-configuration';

function providers(values: Readonly<Record<string, string>>, flags: Readonly<Record<string, boolean>> = {}) {
  const configProvider: IConfigProvider = {
    async get<T>(key: string, defaultValue?: T): Promise<T> {
      return (Object.prototype.hasOwnProperty.call(values, key) ? values[key] : defaultValue) as T;
    },
    async has(key: string): Promise<boolean> {
      return Object.prototype.hasOwnProperty.call(values, key);
    },
    async getAll(): Promise<Record<string, string>> {
      return { ...values };
    },
  };

  const featureFlagProvider: IFeatureFlagProvider = {
    async isEnabled(key: string): Promise<boolean> {
      return flags[key] ?? false;
    },
    async getAllFlags(): Promise<Record<string, boolean>> {
      return { ...flags };
    },
  };

  return { configProvider, featureFlagProvider };
}

describe('Configuration frontend bootstrap freeze', () => {
  it('has exactly one physical GetInitConfigUseCase owner under Configuration application', () => {
    const root = process.cwd();
    const canonical = path.join(root, 'domains/configuration/application/use-cases/GetInitConfigUseCase.ts');
    const legacy = path.join(root, 'apps/api/src/modules/config/use-cases/GetInitConfigUseCase.ts');
    expect(fs.existsSync(canonical)).toBe(true);
    expect(fs.existsSync(legacy)).toBe(false);
    const source = fs.readFileSync(canonical, 'utf8');
    expect(source).not.toContain("from '@carbroz/domain-configuration'");
  });

  it('keeps Configuration as the single owner of the complete frontend startup snapshot', async () => {
    const { configProvider, featureFlagProvider } = providers(
      {
        'maintenance.enabled': 'true',
        'maintenance.message': 'Scheduled maintenance',
        'android.minVersion': '1.4.0',
        'android.latestVersion': '1.9.0',
        'ios.minVersion': '1.3.0',
        'ios.latestVersion': '1.8.0',
        'startup.guest.destination': 'auth_template',
        'startup.guest.api': 'auth/auth_login',
        'startup.authenticated.destination': 'dashboard_template',
        'startup.authenticated.api': 'dashboard/home',
      },
      { wallet: true, subscriptions: false },
    );

    const result = await new GetInitConfigUseCase(configProvider, featureFlagProvider).execute();

    expect(result).toEqual({
      maintenance: { enabled: true, message: 'Scheduled maintenance' },
      forceUpdate: {
        android: { minVersion: '1.4.0', latestVersion: '1.9.0' },
        ios: { minVersion: '1.3.0', latestVersion: '1.8.0' },
      },
      featureFlags: { wallet: true, subscriptions: false },
      startupRouting: {
        guest: { destination: 'auth_template', api: 'auth/auth_login' },
        authenticated: { destination: 'dashboard_template', api: 'dashboard/home' },
      },
    });
  });

  it('keeps deterministic safe bootstrap defaults for an empty Configuration store', async () => {
    const { configProvider, featureFlagProvider } = providers({});

    await expect(new GetInitConfigUseCase(configProvider, featureFlagProvider).execute()).resolves.toEqual({
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

  it('honors the canonical boolean produced when ConfigProvider JSON-decodes persisted true', async () => {
    const now = new Date('2026-09-07T00:00:00.000Z');
    const configRepository = {
      async findByKey(key: string) {
        if (key !== 'maintenance.enabled') return null;
        return {
          id: 1,
          publicId: 'cfg_maintenance_enabled',
          key,
          value: 'true',
          description: null,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        };
      },
    } as unknown as IConfigRepository;
    const configProvider = new ConfigProvider(configRepository);
    const { featureFlagProvider } = providers({});

    expect(await configProvider.get<boolean>('maintenance.enabled', false)).toBe(true);
    const result = await new GetInitConfigUseCase(configProvider, featureFlagProvider).execute();
    expect(result.maintenance.enabled).toBe(true);
  });

  it('interprets maintenance mode as enabled only for canonical true values', async () => {
    const disabled = providers({ 'maintenance.enabled': 'TRUE' });
    const result = await new GetInitConfigUseCase(disabled.configProvider, disabled.featureFlagProvider).execute();
    expect(result.maintenance.enabled).toBe(false);
  });
});
