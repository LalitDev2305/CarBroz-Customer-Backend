import { ScreenRegistry } from './ScreenRegistry.js';
import { partnerScreens } from '../screens/partner/index.js';

/** Single deterministic production registry for all engine-owned screen composers. */
export function createProductionScreenRegistry(): ScreenRegistry {
  const registry = new ScreenRegistry();
  for (const composer of partnerScreens) registry.register(composer);
  return registry;
}
