import type { AwilixContainer } from 'awilix';
import { registerAddressModule } from './address/address.module.js';
import { registerGarageModule } from './garage/garage.module.js';
import { registerCustomerProfileModule } from './profile/profile.module.js';

/** registerCustomerModule is an exported domains/customer contract/implementation; see the owning README for lifecycle and extension rules. */
export function registerCustomerModule(container: AwilixContainer): void {
  registerCustomerProfileModule(container);
  registerAddressModule(container);
  registerGarageModule(container);
}
