import type { SduiScreen, SduiTargetApp } from './core/SduiModel.js';
import type { ScreenContext } from './core/ScreenContext.js';
import { SduiValidator } from './core/SduiValidator.js';
import { ScreenRegistry } from './registry/ScreenRegistry.js';
import { createProductionScreenRegistry } from './registry/createProductionScreenRegistry.js';

export interface BuildScreenRequest {
  readonly targetApp: SduiTargetApp;
  readonly screenId: string;
  readonly context?: ScreenContext;
}

/** Single application-facing façade for dynamic SDUI screen composition. */
export class SduiService {
  constructor(
    private readonly registry: ScreenRegistry,
    private readonly validator: SduiValidator,
  ) {}

  buildScreen(request: BuildScreenRequest): SduiScreen {
    const composer = this.registry.get(request.targetApp, request.screenId);
    const screen = composer.build(request.context ?? {});

    if (screen.screenId !== request.screenId) {
      throw new Error(`SDUI composer returned screenId '${screen.screenId}' for requested screen '${request.screenId}'`);
    }
    if (screen.targetApp !== request.targetApp) {
      throw new Error(`SDUI composer returned target '${screen.targetApp}' for requested target '${request.targetApp}'`);
    }

    return this.validator.validate(screen);
  }
}

export function createProductionSduiService(): SduiService {
  return new SduiService(createProductionScreenRegistry(), new SduiValidator());
}

/** Stateless screen composers make this process-level service safe to reuse. */
export const productionSduiService = createProductionSduiService();
