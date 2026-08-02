import { z } from 'zod';

export const securitySchema = z.object({
  CORS_ORIGIN: z.string().default('*'),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
});

export type SecurityConfigType = z.infer<typeof securitySchema>;
