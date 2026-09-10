import { z } from 'zod';
import type { NodeDefinition } from '../../core/NodeDefinition.js';
import { containerPropertyShape, DEFAULT_STACK_BASE_PROPERTIES } from '../../core/value-objects/Layout.js';

export const STACK_TEMPLATE = 'stack_template';

export const stackTemplatePropertiesSchema = z.object({
  ...containerPropertyShape,
}).strict();

export type StackTemplateProperties = z.infer<typeof stackTemplatePropertiesSchema>;

export const StackTemplateDefinition: NodeDefinition<StackTemplateProperties> = {
  type: STACK_TEMPLATE,
  level: 'template',
  defaults: DEFAULT_STACK_BASE_PROPERTIES,
  properties: stackTemplatePropertiesSchema,
  children: 'components',
  categories: ['base', 'style', 'metadata'],
};
