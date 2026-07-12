import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BaseScreenBuilder } from '../builders/BaseScreenBuilder.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export class ScreenFactory {
    builders = new Map();
    /**
     * Dynamically loads all builder classes from the builders directory,
     * completely eliminating the need to manually register new screens.
     */
    async initialize() {
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
                        const instance = new BuilderClass();
                        this.registerBuilder(instance.screenId, instance);
                        console.log(`[ScreenFactory] Auto-registered builder for screen: "${instance.screenId}"`);
                    }
                }
            }
        }
    }
    registerBuilder(screenId, builder) {
        this.builders.set(screenId, builder);
    }
    async buildScreen(screenId, context) {
        const builder = this.builders.get(screenId);
        if (!builder) {
            throw new Error(`Screen builder not found for screenId: ${screenId}`);
        }
        return await builder.build(context);
    }
}
//# sourceMappingURL=ScreenFactory.js.map