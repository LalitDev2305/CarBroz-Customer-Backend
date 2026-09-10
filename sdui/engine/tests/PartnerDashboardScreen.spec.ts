import { describe, expect, it } from 'vitest';
import { PartnerDashboardScreen, SduiValidator } from '../src/index.js';

describe('PartnerDashboardScreen', () => {
  it('builds the canonical authenticated Partner Dashboard shell', () => {
    const validated = new SduiValidator().validate(new PartnerDashboardScreen().build({}));

    expect(validated.screenId).toBe('partner_dashboard');
    expect(validated.targetApp).toBe('PARTNER');
    expect(validated.template.id).toBe('partner_dashboard_template');
    expect(validated.template.type).toBe('default_template');
    expect(validated.template.components).toEqual([
      expect.objectContaining({
        id: 'dashboard_shell',
        type: 'stack_component',
        elements: [
          expect.objectContaining({ id: 'dashboard_title', type: 'text', properties: expect.objectContaining({ text: 'Partner Dashboard' }) }),
          expect.objectContaining({ id: 'dashboard_status', type: 'text', properties: expect.objectContaining({ text: 'Your workspace is ready.' }) }),
        ],
      }),
    ]);
  });
});
