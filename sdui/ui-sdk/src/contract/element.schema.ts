import { z } from 'zod';
import { actionsSchema, idSchema, propertiesSchema, typeSchema } from './common.schema.js';

export const elementSchema = z.object({
  id: idSchema,
  type: typeSchema,
  properties: propertiesSchema.default({}),
  actions: actionsSchema.optional(),
  analytics: z.record(z.string(), z.unknown()).optional(),
  accessibility: z.record(z.string(), z.unknown()).optional(),
  validation: z.record(z.string(), z.unknown()).optional(),
  binding: z.record(z.string(), z.unknown()).optional(),
  visibility: z.record(z.string(), z.unknown()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).strict();

export type SduiElement = z.infer<typeof elementSchema>;
