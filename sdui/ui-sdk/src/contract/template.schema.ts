import { z } from 'zod';
import { idSchema, propertiesSchema, typeSchema } from './common.schema.js';
import { componentSchema } from './component.schema.js';

export const templateSchema = z.object({
  id: idSchema,
  type: typeSchema,
  properties: propertiesSchema.optional(),
  components: z.array(componentSchema).min(1),
}).strict();

/** SduiTemplate is an exported sdui/ui-sdk contract/implementation; see the owning README for lifecycle and extension rules. */
export type SduiTemplate = z.infer<typeof templateSchema>;
