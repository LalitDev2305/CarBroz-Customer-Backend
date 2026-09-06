import { z } from 'zod';
import { idSchema, propertiesSchema, typeSchema } from './common.schema.js';
import { elementSchema } from './element.schema.js';

export const groupSchema = z.object({
  id: idSchema,
  type: typeSchema,
  properties: propertiesSchema.optional(),
  elements: z.array(elementSchema).min(1),
}).strict();

/** SduiGroup is an exported sdui/ui-sdk contract/implementation; see the owning README for lifecycle and extension rules. */
export type SduiGroup = z.infer<typeof groupSchema>;
