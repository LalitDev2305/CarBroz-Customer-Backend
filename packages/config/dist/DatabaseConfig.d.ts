import { z } from 'zod';
export declare const databaseSchema: z.ZodObject<{
    DATABASE_URL: z.ZodString;
}, z.core.$strip>;
export type DatabaseConfigType = z.infer<typeof databaseSchema>;
