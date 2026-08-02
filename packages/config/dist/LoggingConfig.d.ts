import { z } from 'zod';
export declare const loggingSchema: z.ZodObject<{
    LOG_LEVEL: z.ZodDefault<z.ZodEnum<{
        error: "error";
        fatal: "fatal";
        warn: "warn";
        info: "info";
        debug: "debug";
        trace: "trace";
    }>>;
}, z.core.$strip>;
export type LoggingConfigType = z.infer<typeof loggingSchema>;
