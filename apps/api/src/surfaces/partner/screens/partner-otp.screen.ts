import type { SduiScreen } from '@carbroz/ui-sdk';
import { PartnerOtpScreenBuilder } from './builders/partner-otp-screen.builder.js';

/**
 * Public Partner OTP SDUI composition.
 * OTP verification business/security behavior remains owned by Identity.
 */
export function createPartnerOtpScreen(): SduiScreen {
  return new PartnerOtpScreenBuilder().build();
}
