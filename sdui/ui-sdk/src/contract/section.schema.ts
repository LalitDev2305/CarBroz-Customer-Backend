import { z } from 'zod';
import { idSchema, propertiesSchema, typeSchema } from './common.schema.js';
import { elementSchema } from './element.schema.js';
import { groupSchema } from './group.schema.js';

const sectionBase = {
  id: idSchema,
  type: typeSchema,
  properties: propertiesSchema.optional(),
};

export const directElementSectionSchema = z.object({
  ...sectionBase,
  elements: z.array(elementSchema).min(1),
}).strict();

export const groupedSectionSchema = z.object({
  ...sectionBase,
  groups: z.array(groupSchema).min(1),
}).strict();

export const sectionSchema = z.union([
  directElementSectionSchema,
  groupedSectionSchema,
]);

export type SduiSection = z.infer<typeof sectionSchema>;
