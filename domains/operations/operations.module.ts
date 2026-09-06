import type { AwilixContainer } from 'awilix';
import { registerTrackingModule } from './tracking/tracking.module.js';

/** registerOperationsModule is an exported domains/operations contract/implementation; see the owning README for lifecycle and extension rules. */
export function registerOperationsModule(container: AwilixContainer): void {
  registerTrackingModule(container);
}
