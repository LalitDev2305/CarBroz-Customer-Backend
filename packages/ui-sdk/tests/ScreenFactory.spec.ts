import { describe, it, expect } from 'vitest';
import { ScreenFactory, BaseScreenBuilder, IScreen, BuildContext } from '../src/index.js';

class TestScreenBuilder extends BaseScreenBuilder {
  public readonly screenId = 'test_screen';
  public async build(context?: BuildContext): Promise<IScreen> {
    return {
      screenId: 'test_screen',
      templateId: 'test_template',
      templateType: 'single_column',
      template: { id: 'test_template', type: 'single_column' }
    };
  }
}

describe('@carbroz/ui-sdk - ScreenFactory', () => {
  it('should register and build a screen builder correctly', async () => {
    const factory = new ScreenFactory();
    const builder = new TestScreenBuilder();
    factory.registerBuilder('test_screen', builder);

    const screen = await factory.buildScreen('test_screen');
    expect(screen.screenId).toBe('test_screen');
    expect(screen.templateId).toBe('test_template');
  });

  it('should throw error when screen is not found', async () => {
    const factory = new ScreenFactory();
    await expect(factory.buildScreen('non_existent')).rejects.toThrow('Screen builder not found');
  });
});
