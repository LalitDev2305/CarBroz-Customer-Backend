import { z } from 'zod';
export const providersSchema = z.object({
    MINIO_ENDPOINT: z.string().default('localhost'),
    MINIO_PORT: z.coerce.number().default(9000),
    MINIO_USE_SSL: z.coerce.boolean().default(false),
    MINIO_ACCESS_KEY: z.string().optional(),
    MINIO_SECRET_KEY: z.string().optional(),
});
//# sourceMappingURL=ProvidersConfig.js.map