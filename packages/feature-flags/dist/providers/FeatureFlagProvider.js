export class FeatureFlagProvider {
    repository;
    constructor(featureFlagRepository) {
        this.repository = featureFlagRepository;
    }
    async isEnabled(key) {
        const flag = await this.repository.findByKey(key);
        return flag ? flag.enabled : false;
    }
    async getAllFlags() {
        const flags = await this.repository.findAllFlags();
        const result = {};
        for (const flag of flags) {
            result[flag.key] = flag.enabled;
        }
        return result;
    }
}
//# sourceMappingURL=FeatureFlagProvider.js.map