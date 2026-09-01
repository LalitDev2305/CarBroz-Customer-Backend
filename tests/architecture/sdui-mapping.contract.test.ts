import { describe, expect, it } from 'vitest';
import { screenSchema } from '@carbroz/sdui-engine';

describe('SDUI V3 canonical terminology', () => {
  it('accepts the canonical Template -> Component -> Section -> Group -> Element hierarchy', () => {
    const screen = {
      screenId: 'mapping-test',
      templateId: 'mapping-template',
      templateType: 'default',
      schemaVersion: '3.0',
      targetApp: 'CUSTOMER',
      template: {
        id: 'mapping-template',
        type: 'default',
        components: [
          {
            id: 'component-1',
            type: 'container',
            sections: [
              {
                id: 'section-1',
                type: 'section',
                groups: [
                  {
                    id: 'group-1',
                    type: 'group',
                    elements: [{ id: 'element-1', type: 'text', properties: { text: 'CarBroz' } }],
                  },
                ],
              },
            ],
          },
        ],
      },
    };

    expect(screenSchema.safeParse(screen).success).toBe(true);
  });
});
