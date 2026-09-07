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
    DESKTOP: {
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
    const update = document.update?.[input.platform] as PartnerPlatformUpdateConfig | undefined;
    this.assertUpdate(update, input.platform);
    const minimumComparison = compareApplicationVersions(input.appVersion, update.minimumVersion);
    const latestComparison = compareApplicationVersions(input.appVersion, update.latestVersion);

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

    this.assertScreen(document.startup?.guest, 'guest');
    this.assertScreen(document.startup?.authenticated, 'authenticated');
  }

  private assertUpdate(update: PartnerPlatformUpdateConfig | undefined, platform: string): asserts update is PartnerPlatformUpdateConfig {
    if (!update) throw new DomainError(`Missing Partner update configuration for ${platform}`);
    compareApplicationVersions(update.minimumVersion, update.latestVersion);
    if (compareApplicationVersions(update.latestVersion, update.minimumVersion) < 0) {
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

/**
 * Update eligibility compares the numeric release core while preserving the full client version as identity.
 * Flavor/prerelease/build suffixes such as `1.0.0-dev` or `1.0.0+42` are accepted but do not create a
 * second client version or accidentally force an update solely because of the flavor suffix.
 */
function compareApplicationVersions(left: string, right: string): number {
  const leftParts = parseApplicationVersionCore(left);
  const rightParts = parseApplicationVersionCore(right);
  const length = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < length; index += 1) {
    const leftPart = leftParts[index] ?? 0;
    const rightPart = rightParts[index] ?? 0;
    if (leftPart < rightPart) return -1;
    if (leftPart > rightPart) return 1;
  }

  return 0;
}

function parseApplicationVersionCore(version: string): number[] {
  const value = version?.trim();
  const match = /^(\d+(?:\.\d+)*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.exec(value ?? '');
  if (!match) {
    throw new DomainError(`Invalid application version: ${version}`);
  }
  return match[1]!.split('.').map((part) => Number(part));
}
