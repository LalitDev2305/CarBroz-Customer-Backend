import { z } from 'zod';
import { stackSectionPropertiesSchema } from '../stack/stack-section.properties.js';

export const contentSectionPropertiesSchema = stackSectionPropertiesSchema;
export type ContentSectionProperties = z.infer<typeof contentSectionPropertiesSchema>;
