import { z } from 'zod';
export declare const uuidSchema: z.ZodString;
export declare const emailSchema: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
export declare const phoneSchema: z.ZodString;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const dateSchema: z.ZodCoercedDate<unknown>;
export declare const passwordSchema: z.ZodString;
export declare const createEnumSchema: <T extends [string, ...string[]]>(values: T) => z.ZodEnum<{ [k_1 in T[number]]: k_1; } extends infer T_1 ? { [k in keyof T_1]: T_1[k]; } : never>;
