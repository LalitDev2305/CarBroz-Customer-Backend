import { z } from 'zod';

export const jwtSchema = z.object({
  JWT_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),
  JWT_ISSUER: z.string().default('carbroz.com'),
  JWT_AUDIENCE: z.string().default('carbroz-users'),
});

export type JwtConfigType = z.infer<typeof jwtSchema>;
