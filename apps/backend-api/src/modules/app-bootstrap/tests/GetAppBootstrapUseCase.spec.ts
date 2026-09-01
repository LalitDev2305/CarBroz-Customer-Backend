import { describe, expect, it } from 'vitest';
import { GetAppBootstrapUseCase } from '../use-cases/GetAppBootstrapUseCase.js';

const baseConfig: Record<string, unknown> = {
  'bootstrap.schemaVersion': 1,
  'sdui.protocolVersion': 1,
  'sdui.schemaVersion': 1,
  'app.partner.name': 'CarBroz Partner',
  'bootstrap.public.legal': { termsUrl: '/terms' },
  'bootstrap.public.branding': { brand: 'CarBroz' },
  'partner.update.mode': 'NONE',
  'partner.update.minimumSupportedBuild': 10,
  'partner.update.latestBuild': 12,
  'maintenance.enabled': false,
  'bootstrap.capabilities': { booking: true },
  'bootstrap.serviceability': { country: 'IN' },
  'bootstrap.realtime': { enabled: true },
  'bootstrap.localization': { locale: 'en-IN', currency: 'INR' },
  'bootstrap.support': { phone: '+91-0000000000' },
  'bootstrap.runtimePolicy': { configTtlSeconds: 3600 },
};

function createUseCase(overrides: Record<string, unknown> = {}, authData?: {
  user?: any;
  session?: any;
  memberships?: any[];
  partner?: any;
}) {
  const values = { ...baseConfig, ...overrides };
  const configProvider = {
    get: async <T>(key: string, defaultValue?: T): Promise<T> =>
      (key in values ? values[key] : defaultValue) as T,
  } as any;
  const featureFlagProvider = {
    getAllFlags: async () => ({ dynamicLogin: true }),
  } as any;
  const userRepository = {
    findById: async () => authData?.user ?? null,
  } as any;
  const userSessionRepository = {
    findById: async () => authData?.session ?? null,
  } as any;
  const partnerMemberRepository = {
    findByUserId: async () => authData?.memberships ?? [],
  } as any;
  const partnerRepository = {
    findById: async () => authData?.partner ?? null,
  } as any;

  return new GetAppBootstrapUseCase(
    configProvider,
    featureFlagProvider,
    userRepository,
    userSessionRepository,
    partnerMemberRepository,
    partnerRepository,
  );
}

const client = {
  appVersion: '1.0.0',
  buildNumber: 12,
  applicationId: 'com.carbroz.partner',
  bootstrapSchemaVersion: 1,
  sduiProtocolVersion: 1,
  sduiSchemaVersion: 1,
};

describe('GetAppBootstrapUseCase', () => {
  it('returns anonymous startup state and backend-owned login instruction', async () => {
    const result = await createUseCase().execute({ client, auth: {}, requestId: 'trace-1' });

    expect(result.session.authenticated).toBe(false);
    expect(result.user).toBeNull();
    expect(result.partner).toBeNull();
    expect(result.nextScreen.screenId).toBe('partner_auth');
    expect(result.nextScreen.endpoint).toBe('/api/v1/ui/auth_login');
    expect(result.config.changed).toBe(true);
    expect(result.config.data).toEqual({
      application: { name: 'CarBroz Partner' },
      legal: { termsUrl: '/terms' },
      branding: { brand: 'CarBroz' },
    });
    expect(result.featureFlags.dynamicLogin).toBe(true);
  });

  it('omits unchanged cached public config while keeping volatile startup state fresh', async () => {
    const useCase = createUseCase();
    const first = await useCase.execute({ client, auth: {} });
    const second = await useCase.execute({
      client: { ...client, configVersion: first.config.version },
      auth: {},
    });

    expect(second.config.changed).toBe(false);
    expect(second.config.data).toBeUndefined();
    expect(second.maintenance.enabled).toBe(false);
    expect(second.featureFlags.dynamicLogin).toBe(true);
    expect(second.nextScreen.endpoint).toBe('/api/v1/ui/auth_login');
  });

  it('forces update when the client build is below the minimum supported build', async () => {
    const result = await createUseCase().execute({
      client: { ...client, buildNumber: 9 },
      auth: {},
    });

    expect(result.updatePolicy.mode).toBe('REQUIRED');
    expect(result.updatePolicy.minimumSupportedBuild).toBe(10);
    expect(result.updatePolicy.latestBuild).toBe(12);
  });

  it('restores authenticated user and partner context only from a valid live session', async () => {
    const now = new Date();
    const result = await createUseCase({}, {
      user: {
        id: 7,
        publicId: 'usr_public',
        phoneNumber: '+919999999999',
        email: 'partner@example.com',
        deletedAt: null,
      },
      session: {
        id: 11,
        publicId: 'session_public',
        userId: 7,
        isRevoked: false,
        deletedAt: null,
      },
      memberships: [{ id: 3, partnerId: 21, status: 'ACTIVE' }],
      partner: {
        id: 21,
        publicId: 'partner_public',
        type: 'INDIVIDUAL',
        status: 'ACTIVE',
        deletedAt: null,
        createdAt: now,
        updatedAt: now,
      },
    }).execute({
      client,
      auth: { userId: 7, sessionId: 11, tokenExpiresAtEpochMilliseconds: 1_800_000_000_000 },
    });

    expect(result.session).toEqual({
      authenticated: true,
      sessionId: 'session_public',
      expiresAtEpochMilliseconds: 1_800_000_000_000,
    });
    expect(result.user?.id).toBe('usr_public');
    expect(result.partner?.partnerId).toBe('partner_public');
    expect(result.nextScreen.screenId).toBe('partner_home');
    expect(result.nextScreen.authentication).toBe('SESSION');
  });

  it('downgrades stale or revoked authentication to anonymous startup state', async () => {
    const result = await createUseCase({}, {
      user: { id: 7, publicId: 'usr_public', deletedAt: null },
      session: { id: 11, publicId: 'session_public', userId: 7, isRevoked: true, deletedAt: null },
    }).execute({
      client,
      auth: { userId: 7, sessionId: 11 },
    });

    expect(result.session.authenticated).toBe(false);
    expect(result.user).toBeNull();
    expect(result.partner).toBeNull();
    expect(result.nextScreen.screenId).toBe('partner_auth');
  });

  it('rejects incompatible bootstrap and SDUI protocol contracts', async () => {
    await expect(createUseCase().execute({
      client: { ...client, sduiProtocolVersion: 2 },
      auth: {},
    })).rejects.toThrow('Unsupported SDUI protocol version');
  });

  it('rejects unsafe backend-configured dynamic endpoints', async () => {
    const unsafeInstruction = {
      screenId: 'partner_auth',
      templateId: 'partner_auth',
      templateType: 'FORM_TEMPLATE',
      endpoint: 'https://evil.example/login',
      method: 'GET',
      authentication: 'NONE',
      transition: 'REPLACE',
      restorePolicy: 'NETWORK_ONLY',
      payload: {},
    };

    await expect(createUseCase({
      'bootstrap.nextScreen.anonymous': unsafeInstruction,
    }).execute({ client, auth: {} })).rejects.toThrow('Invalid bootstrap next screen endpoint');
  });
});
