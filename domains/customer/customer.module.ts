import type { AwilixContainer } from 'awilix';
import { registerGarageModule } from './garage/garage.module.js';

export function registerCustomerModule(container: AwilixContainer): void {
  registerGarageModule(container);
}
