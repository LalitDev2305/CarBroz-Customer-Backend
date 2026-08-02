import { z } from 'zod';
export declare const jwtSchema: z.ZodObject<{
    JWT_SECRET: z.ZodString;
    JWT_ACCESS_EXPIRATION: z.ZodDefault<z.ZodString>;
    JWT_REFRESH_EXPIRATION: z.ZodDefault<z.ZodString>;
    JWT_ISSUER: z.ZodDefault<z.ZodString>;
    JWT_AUDIENCE: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export type JwtConfigType = z.infer<typeof jwtSchema>;
