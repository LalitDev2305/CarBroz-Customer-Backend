export class ConfigProvider {
    repository;
    constructor(configRepository) {
        this.repository = configRepository;
    }
    async get(key, defaultValue) {
        const config = await this.repository.findByKey(key);
        if (!config) {
            if (defaultValue !== undefined) {
                return defaultValue;
            }
            throw new Error(`Configuration key not found: ${key}`);
        }
        try {
            return JSON.parse(config.value);
        }
        catch {
            return config.value;
        }
    }
    async has(key) {
        const config = await this.repository.findByKey(key);
        return config !== null;
    }
    async getAll() {
        const configs = await this.repository.findAllConfig();
        const result = {};
        for (const config of configs) {
            result[config.key] = config.value;
        }
        return result;
    }
}
//# sourceMappingURL=ConfigProvider.js.map