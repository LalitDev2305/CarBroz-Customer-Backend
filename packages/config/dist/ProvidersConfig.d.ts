import { z } from 'zod';
export declare const providersSchema: z.ZodObject<{
    MINIO_ENDPOINT: z.ZodDefault<z.ZodString>;
    MINIO_PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    MINIO_USE_SSL: z.ZodDefault<z.ZodCoercedBoolean<unknown>>;
    MINIO_ACCESS_KEY: z.ZodOptional<z.ZodString>;
    MINIO_SECRET_KEY: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ProvidersConfigType = z.infer<typeof providersSchema>;
