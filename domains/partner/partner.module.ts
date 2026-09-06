import type { AwilixContainer } from 'awilix';
import { registerPartnerProfileModule } from './partner-profile.module.js';
import { registerPartnerKycModule } from './kyc/partner-kyc.module.js';

/** registerPartnerModule is an exported domains/partner contract/implementation; see the owning README for lifecycle and extension rules. */
export function registerPartnerModule(container: AwilixContainer): void {
  registerPartnerProfileModule(container);
  registerPartnerKycModule(container);
}
