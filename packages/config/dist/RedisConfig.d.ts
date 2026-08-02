import { z } from 'zod';
export declare const redisSchema: z.ZodObject<{
    REDIS_URL: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export type RedisConfigType = z.infer<typeof redisSchema>;
