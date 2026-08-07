import fs from 'fs';
import path from 'path';
import { IScreenBuilder } from '../builders/IScreenBuilder.js';
import { IScreen } from '../models/ui.models.js';
import { BaseScreenBuilder } from '../builders/BaseScreenBuilder.js';

export class ScreenFactory {
  private builders: Map<string, IScreenBuilder> = new Map();

  public registerBuilder(screenId: string, builder: IScreenBuilder): void {
    this.builders.set(screenId, builder);
  }

  public registerBuilders(builders: BaseScreenBuilder[]): void {
    for (const builder of builders) {
      this.registerBuilder(builder.screenId, builder);
    }
  }

  public async initialize(customBuildersDir?: string): Promise<void> {
    if (!customBuildersDir) return;
    try {
      if (!fs.existsSync(customBuildersDir)) return;
      const files = fs.readdirSync(customBuildersDir);

      for (const file of files) {
        if (file.endsWith('.ts') || file.endsWith('.js')) {
          const modulePath = path.join(customBuildersDir, file);
          const module = await import(modulePath);

          for (const key in module) {
            const BuilderClass = module[key];
            if (typeof BuilderClass === 'function' && BuilderClass.prototype instanceof BaseScreenBuilder) {
              const instance = new BuilderClass() as BaseScreenBuilder;
              this.registerBuilder(instance.screenId, instance);
              console.log(`[ScreenFactory] Auto-registered builder for screen: "${instance.screenId}"`);
            }
          }
        }
      }
    } catch (err) {
      console.warn(`[ScreenFactory] Failed to auto-scan builders from directory: ${customBuildersDir}`, err);
    }
  }

  public async buildScreen(screenId: string, context?: any): Promise<IScreen> {
    const builder = this.builders.get(screenId);
    if (!builder) {
      throw new Error(`Screen builder not found for screenId: ${screenId}`);
    }
    return await builder.build(context);
  }
}
