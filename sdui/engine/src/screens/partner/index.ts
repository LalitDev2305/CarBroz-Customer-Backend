import type { ScreenComposer } from '../../core/ScreenComposer.js';
import { PartnerDashboardScreen } from './PartnerDashboardScreen.js';
import { PartnerLoginScreen } from './PartnerLoginScreen.js';
import { PartnerOtpScreen } from './PartnerOtpScreen.js';

/** Explicit Partner screen registration. Adding a Partner screen means create it, then add it here. */
export const partnerScreens: readonly ScreenComposer[] = Object.freeze([
  new PartnerLoginScreen(),
  new PartnerOtpScreen(),
  new PartnerDashboardScreen(),
]);
