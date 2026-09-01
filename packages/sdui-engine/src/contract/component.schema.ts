import { z } from 'zod';
import { idSchema, propertiesSchema, typeSchema } from './common.schema.js';
import { elementSchema } from './element.schema.js';
import { sectionSchema } from './section.schema.js';

const componentBase = {
  id: idSchema,
  type: typeSchema,
  properties: propertiesSchema.optional(),
};

export const directElementComponentSchema = z.object({
  ...componentBase,
  elements: z.array(elementSchema).min(1),
}).strict();

export const sectionComponentSchema = z.object({
  ...componentBase,
  sections: z.array(sectionSchema).min(1),
}).strict();

export const componentSchema = z.union([
  directElementComponentSchema,
  sectionComponentSchema,
]);

export type SduiComponent = z.infer<typeof componentSchema>;
