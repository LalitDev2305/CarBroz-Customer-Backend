import type { AwilixContainer } from 'awilix';
import { registerTrackingModule } from './tracking/tracking.module.js';

export function registerOperationsModule(container: AwilixContainer): void {
  registerTrackingModule(container);
}
