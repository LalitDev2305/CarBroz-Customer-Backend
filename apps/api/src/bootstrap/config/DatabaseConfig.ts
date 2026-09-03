import { z } from 'zod';

export const databaseSchema = z.object({
  DATABASE_URL: z.string().url(),
});

export type DatabaseConfigType = z.infer<typeof databaseSchema>;
