import type { SduiScreen } from '@carbroz/ui-sdk';
import { PartnerLoginScreenBuilder } from './builders/partner-login-screen.builder.js';

/** Partner Login SDUI composition. Business authentication remains owned by Identity. */
export function createPartnerLoginScreen(): SduiScreen {
  return new PartnerLoginScreenBuilder().build();
}
