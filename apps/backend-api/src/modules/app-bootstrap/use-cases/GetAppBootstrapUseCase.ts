import { createHash } from 'node:crypto';
import {
  BadRequestError,
  IConfigProvider,
  IFeatureFlagProvider,
  IPartnerMemberRepository,
  IPartnerRepository,
  IUserRepository,
  IUserSessionRepository,
  PartnerMemberStatus,
} from '@carbroz/common';
import {
  AppBootstrapAuthContext,
  AppBootstrapClientContext,
  AppBootstrapResponseDto,
  BootstrapMaintenancePolicyDto,
  BootstrapPartnerSnapshotDto,
  BootstrapSessionSnapshotDto,
  BootstrapUpdateMode,
  BootstrapUpdatePolicyDto,
  BootstrapUserSnapshotDto,
  DynamicScreenInstructionDto,
} from '../dtos/app-bootstrap.dto.js';

interface ExecuteInput {
  client: AppBootstrapClientContext;
  auth: AppBootstrapAuthContext;
  requestId?: string;
}

interface AuthenticatedContext {
  session: BootstrapSessionSnapshotDto;
  user: BootstrapUserSnapshotDto | null;
  partner: BootstrapPartnerSnapshotDto | null;
}

/**
 * Application-level startup aggregation for the native Splash screen.
 *
 * This use case composes existing domain/provider owners. It owns no persistence and intentionally
 * keeps identity/session/Partner decisions fresh on every request. Only the explicitly-built
 * public configuration object participates in client-side config version reuse.
 */
export class GetAppBootstrapUseCase {
  constructor(
    private readonly configProvider: IConfigProvider,
    private readonly featureFlagProvider: IFeatureFlagProvider,
    private readonly userRepository: IUserRepository,
    private readonly userSessionRepository: IUserSessionRepository,
    private readonly partnerMemberRepository: IPartnerMemberRepository,
    private readonly partnerRepository: IPartnerRepository,
  ) {}

  public async execute(input: ExecuteInput): Promise<AppBootstrapResponseDto> {
    const serverBootstrapSchema = await this.configProvider.get<number>('bootstrap.schemaVersion', 1);
    const serverSduiProtocol = await this.configProvider.get<number>('sdui.protocolVersion', 1);
    const serverSduiSchema = await this.configProvider.get<number>('sdui.schemaVersion', 1);

    this.assertCompatibility(input.client, serverBootstrapSchema, serverSduiProtocol, serverSduiSchema);

    const [
      featureFlags,
      publicConfiguration,
      updatePolicy,
      maintenance,
      capabilities,
      serviceability,
      realtime,
      localization,
      support,
      runtimePolicy,
      authenticatedContext,
    ] = await Promise.all([
      this.featureFlagProvider.getAllFlags(),
      this.getPublicConfiguration(),
      this.getUpdatePolicy(input.client.buildNumber),
      this.getMaintenancePolicy(),
      this.getObjectConfig('bootstrap.capabilities', {}),
      this.getObjectConfig('bootstrap.serviceability', {}),
      this.getObjectConfig('bootstrap.realtime', {}),
      this.getObjectConfig('bootstrap.localization', {
        locale: 'en-IN',
        fallbackLocale: 'en-IN',
        timezone: 'Asia/Kolkata',
        currency: 'INR',
      }),
      this.getObjectConfig('bootstrap.support', {}),
      this.getObjectConfig('bootstrap.runtimePolicy', {}),
      this.resolveAuthenticatedContext(input.auth),
    ]);

    const configVersion = buildConfigVersion(publicConfiguration);
    const configChanged = input.client.configVersion !== configVersion;
    const nextScreen = await this.resolveNextScreen(authenticatedContext.session.authenticated);

    return {
      meta: {
        requestId: input.requestId,
        serverTimeEpochMilliseconds: Date.now(),
        bootstrapSchemaVersion: serverBootstrapSchema,
      },
      config: {
        changed: configChanged,
        version: configVersion,
        ...(configChanged ? { data: publicConfiguration } : {}),
      },
      updatePolicy,
      maintenance,
      session: authenticatedContext.session,
      user: authenticatedContext.user,
      partner: authenticatedContext.partner,
      sdui: {
        protocolVersion: serverSduiProtocol,
        schemaVersion: serverSduiSchema,
      },
      featureFlags,
      capabilities,
      serviceability,
      realtime,
      localization,
      support,
      runtimePolicy,
      nextScreen,
    };
  }

  private assertCompatibility(
    client: AppBootstrapClientContext,
    bootstrapSchemaVersion: number,
    sduiProtocolVersion: number,
    sduiSchemaVersion: number,
  ): void {
    if (client.bootstrapSchemaVersion !== bootstrapSchemaVersion) {
      throw new BadRequestError('Unsupported bootstrap schema version');
    }
    if (client.sduiProtocolVersion !== sduiProtocolVersion) {
      throw new BadRequestError('Unsupported SDUI protocol version');
    }
    if (client.sduiSchemaVersion !== sduiSchemaVersion) {
      throw new BadRequestError('Unsupported SDUI schema version');
    }
  }

  private async getPublicConfiguration(): Promise<Record<string, unknown>> {
    const [applicationName, legal, branding] = await Promise.all([
      this.configProvider.get<string>('app.partner.name', 'CarBroz Partner'),
      this.getObjectConfig('bootstrap.public.legal', {}),
      this.getObjectConfig('bootstrap.public.branding', {}),
    ]);

    // Deliberate allow-list: never expose ConfigProvider.getAll(), because system config can contain secrets.
    return {
      application: { name: applicationName },
      legal,
      branding,
    };
  }

  private async getUpdatePolicy(clientBuild: number): Promise<BootstrapUpdatePolicyDto> {
    const [configuredMode, title, message, storeUrl, minimumSupportedBuild, latestBuild] = await Promise.all([
      this.configProvider.get<string>('partner.update.mode', 'NONE'),
      this.configProvider.get<string>('partner.update.title', ''),
      this.configProvider.get<string>('partner.update.message', ''),
      this.configProvider.get<string>('partner.update.storeUrl', ''),
      this.configProvider.get<number>('partner.update.minimumSupportedBuild', 1),
      this.configProvider.get<number>('partner.update.latestBuild', 1),
    ]);

    const normalizedConfiguredMode = normalizeUpdateMode(configuredMode);
    const mode: BootstrapUpdateMode = clientBuild < minimumSupportedBuild
      ? 'REQUIRED'
      : normalizedConfiguredMode;

    return compactUndefined({
      mode,
      title: title || undefined,
      message: message || undefined,
      storeUrl: storeUrl || undefined,
      minimumSupportedBuild,
      latestBuild: Math.max(latestBuild, minimumSupportedBuild),
    });
  }

  private async getMaintenancePolicy(): Promise<BootstrapMaintenancePolicyDto> {
    const [enabled, scope, title, message, retryAfterSeconds, supportAllowed] = await Promise.all([
      this.configProvider.get<boolean>('maintenance.enabled', false),
      this.configProvider.get<string>('maintenance.scope', 'PARTNER_APP'),
      this.configProvider.get<string>('maintenance.title', ''),
      this.configProvider.get<string>('maintenance.message', ''),
      this.configProvider.get<number | null>('maintenance.retryAfterSeconds', null),
      this.configProvider.get<boolean>('maintenance.supportAllowed', true),
    ]);

    return compactUndefined({
      enabled: toBoolean(enabled),
      scope: scope || 'PARTNER_APP',
      title: title || undefined,
      message: message || undefined,
      retryAfterSeconds: typeof retryAfterSeconds === 'number' && retryAfterSeconds >= 0
        ? retryAfterSeconds
        : undefined,
      supportAllowed: toBoolean(supportAllowed),
    });
  }

  private async resolveAuthenticatedContext(auth: AppBootstrapAuthContext): Promise<AuthenticatedContext> {
    if (!auth.userId || !auth.sessionId) {
      return anonymousContext();
    }

    const [user, session] = await Promise.all([
      this.userRepository.findById(auth.userId),
      this.userSessionRepository.findById(auth.sessionId),
    ]);

    if (
      !user ||
      user.deletedAt ||
      !session ||
      session.deletedAt ||
      session.isRevoked ||
      session.userId !== user.id
    ) {
      return anonymousContext();
    }

    const memberships = await this.partnerMemberRepository.findByUserId(user.id);
    const activeMembership = memberships
      .filter((membership) => membership.status === PartnerMemberStatus.ACTIVE)
      .sort((left, right) => left.id - right.id)[0];

    const partner = activeMembership
      ? await this.partnerRepository.findById(activeMembership.partnerId)
      : null;

    return {
      session: compactUndefined({
        authenticated: true,
        sessionId: session.publicId,
        expiresAtEpochMilliseconds: auth.tokenExpiresAtEpochMilliseconds,
      }),
      user: compactUndefined({
        id: user.publicId,
        phone: user.phoneNumber || undefined,
        email: user.email || undefined,
      }),
      partner: partner && !partner.deletedAt
        ? compactUndefined({
            partnerId: partner.publicId,
            partnerType: partner.type,
            accountStatus: partner.status,
          })
        : null,
    };
  }

  private async resolveNextScreen(authenticated: boolean): Promise<DynamicScreenInstructionDto> {
    const key = authenticated
      ? 'bootstrap.nextScreen.authenticated'
      : 'bootstrap.nextScreen.anonymous';

    const fallback: DynamicScreenInstructionDto = authenticated
      ? {
          screenId: 'partner_home',
          templateId: 'partner_home',
          templateType: 'FORM_TEMPLATE',
          endpoint: '/api/v1/ui/partner_home',
          method: 'GET',
          authentication: 'SESSION',
          transition: 'REPLACE',
          backStackKey: 'partner_home',
          restorePolicy: 'CACHE_FIRST',
          payload: {},
        }
      : {
          screenId: 'partner_auth',
          templateId: 'partner_auth',
          templateType: 'FORM_TEMPLATE',
          endpoint: '/api/v1/ui/auth_login',
          method: 'GET',
          authentication: 'NONE',
          transition: 'REPLACE',
          backStackKey: 'partner_auth',
          restorePolicy: 'CACHE_FIRST',
          payload: {},
        };

    const configured = await this.configProvider.get<DynamicScreenInstructionDto>(key, fallback);
    return validateInstruction(configured);
  }

  private async getObjectConfig(
    key: string,
    defaultValue: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const value = await this.configProvider.get<unknown>(key, defaultValue);
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return defaultValue;
    }
    return value as Record<string, unknown>;
  }
}

function anonymousContext(): AuthenticatedContext {
  return {
    session: { authenticated: false },
    user: null,
    partner: null,
  };
}

function normalizeUpdateMode(value: string): BootstrapUpdateMode {
  switch (value.trim().toUpperCase()) {
    case 'OPTIONAL': return 'OPTIONAL';
    case 'REQUIRED': return 'REQUIRED';
    default: return 'NONE';
  }
}

function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.trim().toLowerCase() === 'true';
  return Boolean(value);
}

function validateInstruction(value: DynamicScreenInstructionDto): DynamicScreenInstructionDto {
  if (!value || typeof value !== 'object') {
    throw new BadRequestError('Invalid bootstrap next screen configuration');
  }
  if (!value.screenId?.trim() || !value.templateId?.trim() || !value.templateType?.trim()) {
    throw new BadRequestError('Invalid bootstrap next screen identity');
  }
  if (!value.endpoint?.startsWith('/') || value.endpoint.startsWith('//') || value.endpoint.includes('://')) {
    throw new BadRequestError('Invalid bootstrap next screen endpoint');
  }
  if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(value.method)) {
    throw new BadRequestError('Invalid bootstrap next screen method');
  }
  if (!['NONE', 'SESSION'].includes(value.authentication)) {
    throw new BadRequestError('Invalid bootstrap next screen authentication');
  }
  if (!['PUSH', 'REPLACE', 'RESET'].includes(value.transition)) {
    throw new BadRequestError('Invalid bootstrap next screen transition');
  }
  if (!['NETWORK_ONLY', 'CACHE_FIRST', 'CACHE_ONLY'].includes(value.restorePolicy)) {
    throw new BadRequestError('Invalid bootstrap next screen restore policy');
  }

  return {
    ...value,
    payload: value.payload && typeof value.payload === 'object' && !Array.isArray(value.payload)
      ? value.payload
      : {},
  };
}

function buildConfigVersion(value: Record<string, unknown>): string {
  const canonical = JSON.stringify(sortCanonical(value));
  const digest = createHash('sha256').update(canonical).digest('hex');
  return `cfg_${digest}`;
}

function sortCanonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortCanonical);
  if (value && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((result, key) => {
        result[key] = sortCanonical((value as Record<string, unknown>)[key]);
        return result;
      }, {});
  }
  return value;
}

function compactUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as T;
}

export const AppBootstrapInternals = {
  buildConfigVersion,
  sortCanonical,
};
