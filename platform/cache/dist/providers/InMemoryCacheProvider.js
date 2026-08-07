export class InMemoryCacheProvider {
    cache = new Map();
    async get(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return null;
        if (entry.expiresAt && Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        return entry.value;
    }
    async set(key, value, ttlSeconds) {
        const entry = { value };
        if (ttlSeconds) {
            entry.expiresAt = Date.now() + ttlSeconds * 1000;
        }
        this.cache.set(key, entry);
    }
    async delete(key) {
        this.cache.delete(key);
    }
    async clear() {
        this.cache.clear();
    }
}
//# sourceMappingURL=InMemoryCacheProvider.js.map