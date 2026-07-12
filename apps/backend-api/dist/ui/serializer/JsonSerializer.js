export class JsonSerializer {
    static serialize(screen) {
        // Basic null/undefined filtering
        return JSON.parse(JSON.stringify(screen, (key, value) => {
            if (value === null || value === undefined) {
                return undefined;
            }
            return value;
        }));
    }
}
//# sourceMappingURL=JsonSerializer.js.map