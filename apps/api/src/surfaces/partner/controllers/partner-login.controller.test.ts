import { describe, expect, it } from 'vitest';
import { createPartnerLoginScreen } from '../screens/partner-login.screen.js';

describe('Partner Login SDUI composition', () => {
  it('builds a PARTNER-scoped stack screen with the legal hierarchy', () => {
    const screen = createPartnerLoginScreen();
    expect(screen.screenId).toBe('partner_login');
    expect(screen.targetApp).toBe('PARTNER');
    expect(screen.templateType).toBe('stack_template');
    expect(screen.template.components).toHaveLength(3);
  });

  it('keeps country code and editable mobile number as separate elements', () => {
    const screen = createPartnerLoginScreen();
    const content = screen.template.components[1];
    if (!('sections' in content)) throw new Error('expected section branch');
    const fieldSection = content.sections[0];
    if (!('groups' in fieldSection)) throw new Error('expected group branch');
    expect(fieldSection.groups[0].elements.map((element) => element.id)).toEqual(['country_code', 'mobile_number']);
  });
});
