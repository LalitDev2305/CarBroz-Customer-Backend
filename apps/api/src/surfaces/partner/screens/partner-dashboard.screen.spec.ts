import { describe, expect, it } from 'vitest';
import { screenSchema } from '@carbroz/ui-sdk';
import { createPartnerDashboardScreen } from './partner-dashboard.screen.js';

describe('Partner Dashboard Phase 10 contract', () => {
  it('builds the reserved authenticated startup identity with canonical SDUI schema', () => {
    const screen = createPartnerDashboardScreen();
    expect(screenSchema.parse(screen)).toEqual(screen);
    expect(screen.screenId).toBe('partner_dashboard');
    expect(screen.targetApp).toBe('PARTNER');
    expect(screen.template.id).toBe('partner_dashboard_template');
    expect(screen.template.type).toBe('default_template');
  });

  it('is a minimal production shell without fake business data or feature-specific actions', () => {
    const serialized = JSON.stringify(createPartnerDashboardScreen());
    expect(serialized).not.toContain('bookingId');
    expect(serialized).not.toContain('earnings');
    expect(serialized).not.toContain('mock');
  });
});
