import { z } from 'zod';
import type { NodeDefinition } from '../../core/NodeDefinition.js';
import { containerPropertyShape, DEFAULT_STACK_BASE_PROPERTIES, weightSchema } from '../../core/value-objects/Layout.js';

export const STACK_SECTION = 'stack_section';

export const stackSectionPropertiesSchema = z.object({
  ...containerPropertyShape,
  weight: weightSchema.optional(),
}).strict();

export type StackSectionProperties = z.infer<typeof stackSectionPropertiesSchema>;

export const StackSectionDefinition: NodeDefinition<StackSectionProperties> = {
  type: STACK_SECTION,
  level: 'section',
  defaults: DEFAULT_STACK_BASE_PROPERTIES,
  properties: stackSectionPropertiesSchema,
  children: 'elements-or-groups',
  categories: ['base', 'style', 'metadata'],
};
