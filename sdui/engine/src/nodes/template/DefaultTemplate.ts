import { z } from 'zod';
import type { NodeDefinition } from '../../core/NodeDefinition.js';
import { containerPropertyShape, DEFAULT_STACK_BASE_PROPERTIES } from '../../core/value-objects/Layout.js';

export const DEFAULT_TEMPLATE = 'default_template';

export const defaultTemplatePropertiesSchema = z.object({
  ...containerPropertyShape,
}).strict();

export type DefaultTemplateProperties = z.infer<typeof defaultTemplatePropertiesSchema>;

export const DefaultTemplateDefinition: NodeDefinition<DefaultTemplateProperties> = {
  type: DEFAULT_TEMPLATE,
  level: 'template',
  defaults: DEFAULT_STACK_BASE_PROPERTIES,
  properties: defaultTemplatePropertiesSchema,
  children: 'components',
  categories: ['base', 'style', 'metadata'],
};
