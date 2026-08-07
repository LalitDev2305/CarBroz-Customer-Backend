export class SduiGenerator {
    static generateJson(screen) {
        return JSON.parse(JSON.stringify(screen, (key, value) => {
            if (value === null || value === undefined) {
                return undefined;
            }
            return value;
        }));
    }
}
export { SduiGenerator as JsonSerializer };
//# sourceMappingURL=SduiGenerator.js.map