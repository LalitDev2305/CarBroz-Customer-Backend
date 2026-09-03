import { z } from 'zod';

export const appSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
});

export type AppConfigType = z.infer<typeof appSchema>;
