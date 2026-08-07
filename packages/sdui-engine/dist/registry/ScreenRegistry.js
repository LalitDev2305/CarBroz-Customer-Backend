export class ScreenRegistry {
    static builders = new Map();
    static register(screenId, builder) {
        this.builders.set(screenId, builder);
    }
    static get(screenId) {
        return this.builders.get(screenId);
    }
    static has(screenId) {
        return this.builders.has(screenId);
    }
}
//# sourceMappingURL=ScreenRegistry.js.map