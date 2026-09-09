import { z } from 'zod';
import { stackComponentPropertiesSchema } from '../stack/stack-component.properties.js';

export const formComponentPropertiesSchema = stackComponentPropertiesSchema.extend({
  semanticRole: z.literal('form').optional(),
}).strict();
export type FormComponentProperties = z.infer<typeof formComponentPropertiesSchema>;
