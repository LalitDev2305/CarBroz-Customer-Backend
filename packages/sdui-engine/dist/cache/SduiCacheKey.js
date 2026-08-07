export class SduiCacheKey {
    static createKey(screenId, version = 1) {
        return `sdui:${screenId}:v${version}`;
    }
}
//# sourceMappingURL=SduiCacheKey.js.map