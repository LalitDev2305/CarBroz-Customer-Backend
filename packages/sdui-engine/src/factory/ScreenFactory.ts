import { IScreenBuilder } from '../builder/ScreenBuilderContract.js';
import { IScreen } from '../schema/screen/Screen.js';
import { ScreenBuilder } from '../builder/ScreenBuilder.js';
import { ScreenRegistry } from '../registry/ScreenRegistry.js';

export class ScreenFactory {
  public registerBuilder(screenId: string, builder: IScreenBuilder): void {
    ScreenRegistry.register(screenId, builder);
  }

  public registerBuilders(builders: ScreenBuilder[]): void {
    for (const builder of builders) {
      this.registerBuilder(builder.screenId, builder);
    }
  }

  public async buildScreen(screenId: string, context?: any): Promise<IScreen> {
    const builder = ScreenRegistry.get(screenId);
    if (!builder) {
      throw new Error(`Screen builder not found for screenId: ${screenId}`);
    }
    return await builder.build(context);
  }
}
