import { parseSduiScreen, type SduiScreen, type SduiTargetApp } from '@carbroz/ui-sdk';
import type { ScreenContext } from './core/ScreenContext.js';
import { ScreenRegistry } from './registry/ScreenRegistry.js';

export interface BuildScreenRequest {
  readonly targetApp: SduiTargetApp;
  readonly screenId: string;
  readonly context?: ScreenContext;
}

/** Single application-facing façade for dynamic SDUI screen composition. */
export class SduiService {
  constructor(private readonly registry: ScreenRegistry) {}

  buildScreen(request: BuildScreenRequest): SduiScreen {
    const composer = this.registry.resolve(request.targetApp, request.screenId);
    const screen = composer.compose(request.context ?? {});

    if (screen.screenId !== request.screenId) {
      throw new Error(
        `SDUI composer returned screenId '${screen.screenId}' for requested screen '${request.screenId}'`,
      );
    }

    if (screen.targetApp !== request.targetApp) {
      throw new Error(
        `SDUI composer returned target '${screen.targetApp}' for requested target '${request.targetApp}'`,
      );
    }

    return parseSduiScreen(screen);
  }
}
