import { describe, expect, it, vi } from 'vitest';
import type { IConfigProvider } from '../application/IConfigProvider.js';
import type { PartnerBootstrapDocument } from '../application/contracts/partner-bootstrap.js';
import { GetPartnerBootstrapUseCase } from '../application/use-cases/GetPartnerBootstrapUseCase.js';

function providerReturning(value?: PartnerBootstrapDocument): IConfigProvider {
  return { get: vi.fn().mockImplementation(async (_key: string, defaultValue?: unknown) => value ?? defaultValue), has: vi.fn(), getAll: vi.fn() } as unknown as IConfigProvider;
}

function validDocument(): PartnerBootstrapDocument {
  return {
    version: '2', maintenance: { enabled: false, title: null, message: null },
    update: {
      ANDROID: { minimumVersion: '2.0.0', latestVersion: '3.0.0', storeUrl: 'market://carbroz-partner' },
      IOS: { minimumVersion: '1.0.0', latestVersion: '1.0.0', storeUrl: null },
      DESKTOP: { minimumVersion: '1.0.0', latestVersion: '1.0.0', storeUrl: null },
    },
    features: { registrationEnabled: true, individualPartnerEnabled: true, organizationPartnerEnabled: true },
    startup: {
      guest: { screenId: 'partner_login', templateId: 'tpl_7K2M9Q', templateType: 'stack_template', endpoint: '/api/v1/partner/screen/auth_login', method: 'GET', authentication: 'NONE' },
      authenticated: { screenId: 'partner_dashboard', templateId: 'partner_dashboard_template', templateType: 'default_template', endpoint: '/api/v1/partner/sdui/registry/partner_dashboard', method: 'GET', authentication: 'SESSION' },
    },
  };
}

describe('GetPartnerBootstrapUseCase', () => {
  it('returns the canonical unauthenticated Partner login destination', async () => {
    const result = await new GetPartnerBootstrapUseCase(providerReturning()).execute({ platform: 'ANDROID', appVersion: '1.0.0', authenticated: false });
    expect(result.startup).toEqual({ authenticated: false, nextScreen: {
      screenId: 'partner_login', templateId: 'tpl_7K2M9Q', templateType: 'stack_template', endpoint: '/api/v1/partner/screen/auth_login', method: 'GET', authentication: 'NONE',
    } });
  });

  it('keeps authenticated startup unchanged until its published screen route is migrated', async () => {
    const result = await new GetPartnerBootstrapUseCase(providerReturning()).execute({ platform: 'IOS', appVersion: '1.0.0', authenticated: true });
    expect(result.startup.nextScreen).toEqual({ screenId: 'partner_dashboard', templateId: 'partner_dashboard_template', templateType: 'default_template', endpoint: '/api/v1/partner/sdui/registry/partner_dashboard', method: 'GET', authentication: 'SESSION' });
  });

  it('evaluates required and optional updates', async () => {
    const useCase = new GetPartnerBootstrapUseCase(providerReturning(validDocument()));
    expect((await useCase.execute({ platform: 'ANDROID', appVersion: '1.9.0', authenticated: false })).config.update.required).toBe(true);
    expect((await useCase.execute({ platform: 'ANDROID', appVersion: '2.5.0', authenticated: false })).config.update.optional).toBe(true);
  });

  it('supports Desktop flavor suffix versions', async () => {
    const result = await new GetPartnerBootstrapUseCase(providerReturning()).execute({ platform: 'DESKTOP', appVersion: '1.0.0-dev', authenticated: false });
    expect(result.config.update.required).toBe(false);
    expect(result.config.update.optional).toBe(false);
  });

  it('accepts build metadata while comparing numeric release core', async () => {
    const result = await new GetPartnerBootstrapUseCase(providerReturning()).execute({ platform: 'ANDROID', appVersion: '1.0.0-dev+42', authenticated: false });
    expect(result.config.update.required).toBe(false);
  });

  it('keeps legacy platform update config usable for unaffected platforms', async () => {
    const base = validDocument();
    const legacy = { ...base, update: { ANDROID: base.update.ANDROID, IOS: base.update.IOS } } as unknown as PartnerBootstrapDocument;
    const useCase = new GetPartnerBootstrapUseCase(providerReturning(legacy));
    expect((await useCase.execute({ platform: 'ANDROID', appVersion: '2.5.0', authenticated: false })).config.update.optional).toBe(true);
    await expect(useCase.execute({ platform: 'DESKTOP', appVersion: '1.0.0', authenticated: false })).rejects.toThrow('Missing Partner update configuration for DESKTOP');
  });

  it('rejects absolute startup endpoints', async () => {
    const base = validDocument();
    const invalid: PartnerBootstrapDocument = { ...base, startup: { ...base.startup, guest: { ...base.startup.guest, endpoint: 'https://example.com/login' } } };
    await expect(new GetPartnerBootstrapUseCase(providerReturning(invalid)).execute({ platform: 'ANDROID', appVersion: '1.0.0', authenticated: false })).rejects.toThrow('Invalid Partner guest startup endpoint');
  });
});
