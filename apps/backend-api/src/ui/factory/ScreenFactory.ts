import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { IScreenBuilder } from '../builders/IScreenBuilder.js';
import { IScreen } from '../models/ui.models.js';
import { BaseScreenBuilder } from '../builders/BaseScreenBuilder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ScreenFactory {
  private builders: Map<string, IScreenBuilder> = new Map();

  /**
   * Dynamically loads all builder classes from the builders directory,
   * completely eliminating the need to manually register new screens.
   */
  public async initialize(): Promise<void> {
    const buildersDir = path.join(__dirname, '../builders');
    const files = fs.readdirSync(buildersDir);

    for (const file of files) {
      // Skip interfaces and base classes
      if (file === 'IScreenBuilder.ts' || file === 'IScreenBuilder.js' || file === 'BaseScreenBuilder.ts' || file === 'BaseScreenBuilder.js') {
        continue;
      }
      if (file.endsWith('.ts') || file.endsWith('.js')) {
        const modulePath = `../builders/${file}`;
        const module = await import(modulePath);

        // Instantiate and register any exported builder
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
  }

  public registerBuilder(screenId: string, builder: IScreenBuilder): void {
    this.builders.set(screenId, builder);
  }

  public async buildScreen(screenId: string, context?: any): Promise<IScreen> {
    const builder = this.builders.get(screenId);
    if (!builder) {
      throw new Error(`Screen builder not found for screenId: ${screenId}`);
    }
    return await builder.build(context);
  }
}
