import { ScreenRegistry } from '../registry/ScreenRegistry.js';
export class ScreenFactory {
    registerBuilder(screenId, builder) {
        ScreenRegistry.register(screenId, builder);
    }
    registerBuilders(builders) {
        for (const builder of builders) {
            this.registerBuilder(builder.screenId, builder);
        }
    }
    async buildScreen(screenId, context) {
        const builder = ScreenRegistry.get(screenId);
        if (!builder) {
            throw new Error(`Screen builder not found for screenId: ${screenId}`);
        }
        return await builder.build(context);
    }
}
//# sourceMappingURL=ScreenFactory.js.map