import { describe, it, expect } from 'vitest';
import { SduiGenerator, SduiValidator, IScreen } from '../src/index.js';

describe('@carbroz/sdui-engine - SduiGenerator & SduiValidator', () => {
  it('should generate valid json and satisfy contract schema validation', () => {
    const screen: IScreen = {
      screenId: 'test_screen',
      templateId: 'test_template',
      templateType: 'single_column',
      template: {
        id: 'test_template',
        type: 'single_column',
        components: [
          {
            id: 'comp_1',
            type: 'banner',
            subComponents: [
              {
                id: 'sub_1',
                type: 'column',
                children: [
                  {
                    id: 'child_1',
                    type: 'atom_group',
                    childrenData: [
                      {
                        id: 'text_1',
                        type: 'atom_text',
                        properties: { text: 'Hello CarBroz' }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    };

    const json = SduiGenerator.generateJson(screen);
    expect(json.screenId).toBe('test_screen');

    const isValid = SduiValidator.validateScreen(json);
    expect(isValid).toBe(true);
  });
});
