import { z } from 'zod';
import { idSchema, propertiesSchema, typeSchema } from './common.schema.js';
import { elementSchema } from './element.schema.js';

export const groupSchema = z.object({
  id: idSchema,
  type: typeSchema,
  properties: propertiesSchema.optional(),
  elements: z.array(elementSchema).min(1),
}).strict();

export type SduiGroup = z.infer<typeof groupSchema>;
