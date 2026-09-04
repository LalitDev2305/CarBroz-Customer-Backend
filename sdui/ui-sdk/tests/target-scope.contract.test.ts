import { describe, expect, it } from 'vitest';
import { isValidSduiScreen, targetAppSchema } from '../src/public/index.js';

function validScreen(targetApp: 'GLOBAL' | 'PARTNER' | 'CUSTOMER') {
  return {
    screenId: `scope_${targetApp.toLowerCase()}`,
    templateId: 'default_template_instance',
    templateType: 'default_template',
    schemaVersion: '3.0.0',
    targetApp,
    template: {
      id: 'default_template_instance',
      type: 'default_template',
      components: [
        {
          id: 'content',
          type: 'content_component',
          elements: [{ id: 'label', type: 'text', properties: { text: targetApp } }],
        },
      ],
    },
  };
}

describe('canonical SDUI runtime publication scopes', () => {
  it.each(['GLOBAL', 'PARTNER', 'CUSTOMER'] as const)('accepts %s as a runtime scope', (targetApp) => {
    expect(targetAppSchema.safeParse(targetApp).success).toBe(true);
    expect(isValidSduiScreen(validScreen(targetApp))).toBe(true);
  });

  it('rejects ADMIN because Admin manages SDUI but does not render through SDUI', () => {
    expect(targetAppSchema.safeParse('ADMIN').success).toBe(false);
  });

  it.each(['', 'PARTNERR', 'CUSTOMR', 'admin', 'global'])('rejects unsupported scope %s', (targetApp) => {
    expect(targetAppSchema.safeParse(targetApp).success).toBe(false);
  });
});
