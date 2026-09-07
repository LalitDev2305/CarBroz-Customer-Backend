import { describe, expect, it, vi } from 'vitest';
import type { IConfigProvider } from '../application/IConfigProvider.js';
import type { PartnerBootstrapDocument } from '../application/contracts/partner-bootstrap.js';
import { GetPartnerBootstrapUseCase } from '../application/use-cases/GetPartnerBootstrapUseCase.js';

function providerReturning(value?: PartnerBootstrapDocument): IConfigProvider {
  return {
    get: vi.fn().mockImplementation(async (_key: string, defaultValue?: unknown) => value ?? defaultValue),
    has: vi.fn(),
    getAll: vi.fn(),
  } as unknown as IConfigProvider;
}

describe('GetPartnerBootstrapUseCase', () => {
  it('returns the default unauthenticated Partner login startup contract', async () => {
    const useCase = new GetPartnerBootstrapUseCase(providerReturning());

    const result = await useCase.execute({
      platform: 'ANDROID',
      appVersion: '1.0.0',
      authenticated: false,
    });

    expect(result.config).toEqual({
      version: '1',
      maintenance: { enabled: false, title: null, message: null },
      update: {
        required: false,
        optional: false,
        minimumVersion: '1.0.0',
        latestVersion: '1.0.0',
        storeUrl: null,
      },
      features: {
        registrationEnabled: true,
        individualPartnerEnabled: true,
        organizationPartnerEnabled: true,
      },
    });
    expect(result.startup).toEqual({
      authenticated: false,
      nextScreen: {
        screenId: 'partner_login',
        templateId: 'partner_login_template',
        templateType: 'form_template',
        endpoint: '/api/v1/partner/sdui/registry/partner_login',
        method: 'GET',
        authentication: 'NONE',
      },
    });
  });

  it('uses the existing default_template vocabulary for authenticated Partner startup', async () => {
    const useCase = new GetPartnerBootstrapUseCase(providerReturning());

    const result = await useCase.execute({
      platform: 'IOS',
      appVersion: '1.0.0',
      authenticated: true,
    });

    expect(result.startup.authenticated).toBe(true);
    expect(result.startup.nextScreen).toEqual({
      screenId: 'partner_dashboard',
      templateId: 'partner_dashboard_template',
      templateType: 'default_template',
      endpoint: '/api/v1/partner/sdui/registry/partner_dashboard',
      method: 'GET',
      authentication: 'SESSION',
    });
  });

  it('evaluates required and optional updates from the configured Partner platform versions', async () => {
    const document: PartnerBootstrapDocument = {
      version: '2',
      maintenance: { enabled: false, title: null, message: null },
      update: {
        ANDROID: { minimumVersion: '2.0.0', latestVersion: '3.0.0', storeUrl: 'market://carbroz-partner' },
        IOS: { minimumVersion: '1.0.0', latestVersion: '1.0.0', storeUrl: null },
      },
      features: {
        registrationEnabled: true,
        individualPartnerEnabled: true,
        organizationPartnerEnabled: true,
      },
      startup: {
        guest: {
          screenId: 'partner_login',
          templateId: 'partner_login_template',
          templateType: 'form_template',
          endpoint: '/api/v1/partner/sdui/registry/partner_login',
          method: 'GET',
          authentication: 'NONE',
        },
        authenticated: {
          screenId: 'partner_dashboard',
          templateId: 'partner_dashboard_template',
          templateType: 'default_template',
          endpoint: '/api/v1/partner/sdui/registry/partner_dashboard',
          method: 'GET',
          authentication: 'SESSION',
        },
      },
    };
    const useCase = new GetPartnerBootstrapUseCase(providerReturning(document));

    const required = await useCase.execute({ platform: 'ANDROID', appVersion: '1.9.0', authenticated: false });
    const optional = await useCase.execute({ platform: 'ANDROID', appVersion: '2.5.0', authenticated: false });

    expect(required.config.update.required).toBe(true);
    expect(required.config.update.optional).toBe(false);
    expect(optional.config.update.required).toBe(false);
    expect(optional.config.update.optional).toBe(true);
  });

  it('rejects absolute startup endpoints stored in configuration', async () => {
    const invalid = {
      version: '1',
      maintenance: { enabled: false, title: null, message: null },
      update: {
        ANDROID: { minimumVersion: '1.0.0', latestVersion: '1.0.0', storeUrl: null },
        IOS: { minimumVersion: '1.0.0', latestVersion: '1.0.0', storeUrl: null },
      },
      features: {
        registrationEnabled: true,
        individualPartnerEnabled: true,
        organizationPartnerEnabled: true,
      },
      startup: {
        guest: {
          screenId: 'partner_login',
          templateId: 'partner_login_template',
          templateType: 'form_template',
          endpoint: 'https://example.com/login',
          method: 'GET',
          authentication: 'NONE',
        },
        authenticated: {
          screenId: 'partner_dashboard',
          templateId: 'partner_dashboard_template',
          templateType: 'default_template',
          endpoint: '/api/v1/partner/sdui/registry/partner_dashboard',
          method: 'GET',
          authentication: 'SESSION',
        },
      },
    } as PartnerBootstrapDocument;
    const useCase = new GetPartnerBootstrapUseCase(providerReturning(invalid));

    await expect(useCase.execute({ platform: 'ANDROID', appVersion: '1.0.0', authenticated: false }))
      .rejects.toThrow('Invalid Partner guest startup endpoint');
  });
});
