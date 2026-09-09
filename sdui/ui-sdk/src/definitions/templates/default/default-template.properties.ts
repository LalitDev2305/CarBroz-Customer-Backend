import { z } from 'zod';
import { stackTemplatePropertiesSchema } from '../stack/stack-template.properties.js';

export const defaultTemplatePropertiesSchema = stackTemplatePropertiesSchema;
export type DefaultTemplateProperties = z.infer<typeof defaultTemplatePropertiesSchema>;
