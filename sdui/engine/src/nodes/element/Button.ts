import { z } from 'zod';
import type { NodeDefinition } from '../../core/NodeDefinition.js';
import { accessoriesSchema } from '../../core/value-objects/Accessory.js';
import { backgroundSchema, colorSchema, shapeSchema } from '../../core/value-objects/Appearance.js';
import { dimensionSchema } from '../../core/value-objects/Layout.js';

export const BUTTON = 'button';

export const buttonPropertiesSchema = z.object({
  semanticRole: z.literal('action').optional(),
  text: z.string(),
  width: dimensionSchema.optional(),
  height: dimensionSchema.optional(),
  fillMaxWidth: z.boolean().optional(),
  fontSize: z.number().finite().positive().optional(),
  fontWeight: z.number().int().min(100).max(900).optional(),
  textColor: colorSchema.optional(),
  background: backgroundSchema.optional(),
  shape: shapeSchema.optional(),
  leading: accessoriesSchema.optional(),
  trailing: accessoriesSchema.optional(),
}).strict();

export type ButtonProperties = z.infer<typeof buttonPropertiesSchema>;

export const ButtonDefinition: NodeDefinition<ButtonProperties> = {
  type: BUTTON,
  level: 'element',
  properties: buttonPropertiesSchema,
  children: 'none',
};
