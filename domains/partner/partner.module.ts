import type { AwilixContainer } from 'awilix';
import { registerPartnerProfileModule } from './partner-profile.module.js';
import { registerPartnerKycModule } from './kyc/partner-kyc.module.js';

export function registerPartnerModule(container: AwilixContainer): void {
  registerPartnerProfileModule(container);
  registerPartnerKycModule(container);
}
