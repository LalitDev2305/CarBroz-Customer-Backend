import { DomainError } from '@carbroz/foundation-kernel';
import type { IConfigProvider } from '../IConfigProvider.js';
import type {
  PartnerBootstrapDocument,
  PartnerBootstrapRequest,
  PartnerBootstrapSnapshot,
  PartnerPlatformUpdateConfig,
  PartnerStartupScreenConfig,
} from '../contracts/partner-bootstrap.js';

const PARTNER_BOOTSTRAP_CONFIG_KEY = 'partner.bootstrap';

const DEFAULT_PARTNER_BOOTSTRAP_DOCUMENT: PartnerBootstrapDocument = {
  version: '1',
  maintenance: {
    enabled: false,
    title: null,
    message: null,
  },
  update: {
    ANDROID: {
      minimumVersion: '1.0.0',
      latestVersion: '1.0.0',
      storeUrl: null,
    },
    IOS: {
      minimumVersion: '1.0.0',
      latestVersion: '1.0.0',
      storeUrl: null,
    },
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

/**
 * Evaluates the Partner application's small startup configuration surface.
 * It intentionally does not own KYC, jobs, payouts, media, location, or other Partner business policy.
 */
export class GetPartnerBootstrapUseCase {
  constructor(private readonly configProvider: IConfigProvider) {}

  async execute(input: PartnerBootstrapRequest): Promise<PartnerBootstrapSnapshot> {
    const document = await this.configProvider.get<PartnerBootstrapDocument>(
      PARTNER_BOOTSTRAP_CONFIG_KEY,
      DEFAULT_PARTNER_BOOTSTRAP_DOCUMENT,
    );

    this.assertDocument(document);
    const update = document.update[input.platform];
    const minimumComparison = compareNumericVersions(input.appVersion, update.minimumVersion);
    const latestComparison = compareNumericVersions(input.appVersion, update.latestVersion);

    return {
      config: {
        version: document.version,
        maintenance: document.maintenance,
        update: {
          required: minimumComparison < 0,
          optional: minimumComparison >= 0 && latestComparison < 0,
          minimumVersion: update.minimumVersion,
          latestVersion: update.latestVersion,
          storeUrl: update.storeUrl,
        },
        features: document.features,
      },
      startup: {
        authenticated: input.authenticated,
        nextScreen: input.authenticated ? document.startup.authenticated : document.startup.guest,
      },
    };
  }

  private assertDocument(document: PartnerBootstrapDocument): void {
    if (!document || typeof document !== 'object' || !document.version?.trim()) {
      throw new DomainError('Invalid Partner bootstrap configuration document');
    }

    this.assertUpdate(document.update?.ANDROID, 'ANDROID');
    this.assertUpdate(document.update?.IOS, 'IOS');
    this.assertScreen(document.startup?.guest, 'guest');
    this.assertScreen(document.startup?.authenticated, 'authenticated');
  }

  private assertUpdate(update: PartnerPlatformUpdateConfig | undefined, platform: string): void {
    if (!update) throw new DomainError(`Missing Partner update configuration for ${platform}`);
    compareNumericVersions(update.minimumVersion, update.latestVersion);
    if (compareNumericVersions(update.latestVersion, update.minimumVersion) < 0) {
      throw new DomainError(`Invalid Partner update configuration for ${platform}: latestVersion is below minimumVersion`);
    }
  }

  private assertScreen(screen: PartnerStartupScreenConfig | undefined, state: string): void {
    if (!screen || !screen.screenId?.trim() || !screen.templateId?.trim() || !screen.templateType?.trim()) {
      throw new DomainError(`Invalid Partner ${state} startup screen configuration`);
    }
    if (!screen.endpoint.startsWith('/') || screen.endpoint.startsWith('//') || screen.endpoint.includes('://')) {
      throw new DomainError(`Invalid Partner ${state} startup endpoint`);
    }
  }
}

function compareNumericVersions(left: string, right: string): number {
  const leftParts = parseNumericVersion(left);
  const rightParts = parseNumericVersion(right);
  const length = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < length; index += 1) {
    const leftPart = leftParts[index] ?? 0;
    const rightPart = rightParts[index] ?? 0;
    if (leftPart < rightPart) return -1;
    if (leftPart > rightPart) return 1;
  }

  return 0;
}

function parseNumericVersion(version: string): number[] {
  const value = version?.trim();
  if (!value || !/^\d+(?:\.\d+)*$/.test(value)) {
    throw new DomainError(`Invalid application version: ${version}`);
  }
  return value.split('.').map((part) => Number(part));
}
