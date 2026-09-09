import type { SduiScreen } from '@carbroz/ui-sdk';
import { PartnerDashboardScreenBuilder } from './builders/partner-dashboard-screen.builder.js';

/** Minimal authenticated Partner Dashboard shell. Business dashboard data remains owned by its feature contexts. */
export function createPartnerDashboardScreen(): SduiScreen {
  return new PartnerDashboardScreenBuilder().build();
}
