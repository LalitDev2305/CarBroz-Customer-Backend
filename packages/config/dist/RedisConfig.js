import { z } from 'zod';
export const redisSchema = z.object({
    REDIS_URL: z.string().url().default('redis://localhost:6379'),
});
//# sourceMappingURL=RedisConfig.js.map