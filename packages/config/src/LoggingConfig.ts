import { z } from 'zod';

export const loggingSchema = z.object({
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

export type LoggingConfigType = z.infer<typeof loggingSchema>;
