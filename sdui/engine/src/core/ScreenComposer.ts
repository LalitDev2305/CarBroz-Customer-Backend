import type { SduiScreen, SduiTargetApp } from '@carbroz/ui-sdk';
import type { ScreenContext } from './ScreenContext.js';

/** One application-specific SDUI screen recipe. */
export interface ScreenComposer {
  readonly screenId: string;
  readonly targetApp: SduiTargetApp;

  build(context: ScreenContext): SduiScreen;
}
