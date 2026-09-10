import { z } from 'zod';
import type { NodeDefinition } from '../../core/NodeDefinition.js';
import { containerPropertyShape, DEFAULT_STACK_BASE_PROPERTIES, weightSchema } from '../../core/value-objects/Layout.js';

export const STACK_GROUP = 'stack_group';

export const stackGroupPropertiesSchema = z.object({
  ...containerPropertyShape,
  weight: weightSchema.optional(),
}).strict();

export type StackGroupProperties = z.infer<typeof stackGroupPropertiesSchema>;

export const StackGroupDefinition: NodeDefinition<StackGroupProperties> = {
  type: STACK_GROUP,
  level: 'group',
  defaults: DEFAULT_STACK_BASE_PROPERTIES,
  properties: stackGroupPropertiesSchema,
  children: 'elements',
  categories: ['base', 'style', 'metadata'],
};
