import { parseSduiScreen, type SduiScreen } from '@carbroz/ui-sdk';

/** Canonical validation boundary used by the single SDUI engine during convergence. */
export class SduiValidator {
  validate(input: unknown): SduiScreen {
    return parseSduiScreen(input);
  }
}
