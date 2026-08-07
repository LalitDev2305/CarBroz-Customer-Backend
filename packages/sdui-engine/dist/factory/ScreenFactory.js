import fs from 'fs';
import path from 'path';
import { BaseScreenBuilder } from '../builders/BaseScreenBuilder.js';
export class ScreenFactory {
    builders = new Map();
    registerBuilder(screenId, builder) {
        this.builders.set(screenId, builder);
    }
    registerBuilders(builders) {
        for (const builder of builders) {
            this.registerBuilder(builder.screenId, builder);
        }
    }
    async initialize(customBuildersDir) {
        if (!customBuildersDir)
            return;
        try {
            if (!fs.existsSync(customBuildersDir))
                return;
            const files = fs.readdirSync(customBuildersDir);
            for (const file of files) {
                if (file.endsWith('.ts') || file.endsWith('.js')) {
                    const modulePath = path.join(customBuildersDir, file);
                    const module = await import(modulePath);
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
        catch (err) {
            console.warn(`[ScreenFactory] Failed to auto-scan builders from directory: ${customBuildersDir}`, err);
        }
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