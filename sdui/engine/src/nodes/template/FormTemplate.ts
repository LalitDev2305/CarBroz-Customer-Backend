import { z } from 'zod';
import type { NodeDefinition } from '../../core/NodeDefinition.js';
import { containerPropertyShape, DEFAULT_STACK_BASE_PROPERTIES } from '../../core/value-objects/Layout.js';

export const FORM_TEMPLATE = 'form_template';

export const formTemplatePropertiesSchema = z.object({
  ...containerPropertyShape,
  semanticRole: z.literal('form').optional(),
}).strict();

export type FormTemplateProperties = z.infer<typeof formTemplatePropertiesSchema>;

export const FormTemplateDefinition: NodeDefinition<FormTemplateProperties> = {
  type: FORM_TEMPLATE,
  level: 'template',
  defaults: { ...DEFAULT_STACK_BASE_PROPERTIES, semanticRole: 'form' },
  properties: formTemplatePropertiesSchema,
  children: 'components',
  categories: ['base', 'style', 'metadata'],
};
