import { z } from 'zod';
export declare const securitySchema: z.ZodObject<{
    CORS_ORIGIN: z.ZodDefault<z.ZodString>;
    RATE_LIMIT_MAX: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    RATE_LIMIT_WINDOW_MS: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type SecurityConfigType = z.infer<typeof securitySchema>;
