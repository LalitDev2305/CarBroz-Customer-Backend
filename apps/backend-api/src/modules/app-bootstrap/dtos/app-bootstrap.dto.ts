import { z } from 'zod';

const requiredHeader = z.string().trim().min(1);
const nonNegativeIntegerHeader = z.coerce.number().int().nonnegative();
const positiveIntegerHeader = z.coerce.number().int().positive();

export const AppBootstrapHeadersSchema = z.object({
  appVersion: requiredHeader,
  buildNumber: nonNegativeIntegerHeader,
  applicationId: requiredHeader,
  bootstrapSchemaVersion: positiveIntegerHeader,
  sduiProtocolVersion: positiveIntegerHeader,
  sduiSchemaVersion: positiveIntegerHeader,
  configVersion: z.string().trim().min(1).optional(),
});

export type AppBootstrapClientContext = z.infer<typeof AppBootstrapHeadersSchema>;

export interface AppBootstrapAuthContext {
  userId?: number;
  sessionId?: number;
  tokenExpiresAtEpochMilliseconds?: number;
}

export type BootstrapUpdateMode = 'NONE' | 'OPTIONAL' | 'REQUIRED';

export interface BootstrapMetaDto {
  requestId?: string;
  serverTimeEpochMilliseconds: number;
  bootstrapSchemaVersion: number;
}

export interface BootstrapConfigEnvelopeDto {
  changed: boolean;
  version: string;
  data?: Record<string, unknown>;
}

export interface BootstrapUpdatePolicyDto {
  mode: BootstrapUpdateMode;
  title?: string;
  message?: string;
  storeUrl?: string;
  minimumSupportedBuild?: number;
  latestBuild?: number;
}

export interface BootstrapMaintenancePolicyDto {
  enabled: boolean;
  scope: string;
  title?: string;
  message?: string;
  retryAfterSeconds?: number;
  supportAllowed: boolean;
}

export interface BootstrapSessionSnapshotDto {
  authenticated: boolean;
  sessionId?: string;
  expiresAtEpochMilliseconds?: number;
}

export interface BootstrapUserSnapshotDto {
  id: string;
  displayName?: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  status?: string;
}

export interface BootstrapPartnerSnapshotDto {
  partnerId: string;
  partnerType?: string;
  organizationId?: string;
  onboardingStatus?: string;
  verificationStatus?: string;
  accountStatus?: string;
  availabilityStatus?: string;
}

export interface BootstrapSduiPolicyDto {
  protocolVersion: number;
  schemaVersion: number;
}

export interface DynamicScreenInstructionDto {
  screenId: string;
  templateId: string;
  templateType: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  authentication: 'NONE' | 'SESSION';
  transition: 'PUSH' | 'REPLACE' | 'RESET';
  backStackKey?: string;
  restorePolicy: 'NETWORK_ONLY' | 'CACHE_FIRST' | 'CACHE_ONLY';
  payload: Record<string, unknown>;
}

export interface AppBootstrapResponseDto {
  meta: BootstrapMetaDto;
  config: BootstrapConfigEnvelopeDto;
  updatePolicy: BootstrapUpdatePolicyDto;
  maintenance: BootstrapMaintenancePolicyDto;
  session: BootstrapSessionSnapshotDto;
  user: BootstrapUserSnapshotDto | null;
  partner: BootstrapPartnerSnapshotDto | null;
  sdui: BootstrapSduiPolicyDto;
  featureFlags: Record<string, boolean>;
  capabilities: Record<string, unknown>;
  serviceability: Record<string, unknown>;
  realtime: Record<string, unknown>;
  localization: Record<string, unknown>;
  support: Record<string, unknown>;
  runtimePolicy: Record<string, unknown>;
  nextScreen: DynamicScreenInstructionDto;
}
