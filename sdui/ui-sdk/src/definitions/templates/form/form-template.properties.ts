import { z } from 'zod';
import { stackTemplatePropertiesSchema } from '../stack/stack-template.properties.js';

export const formTemplatePropertiesSchema = stackTemplatePropertiesSchema.extend({
  semanticRole: z.literal('form').optional(),
}).strict();
export type FormTemplateProperties = z.infer<typeof formTemplatePropertiesSchema>;
