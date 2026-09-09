import { z } from 'zod';
import { stackComponentPropertiesSchema } from '../stack/stack-component.properties.js';

export const contentComponentPropertiesSchema = stackComponentPropertiesSchema;
export type ContentComponentProperties = z.infer<typeof contentComponentPropertiesSchema>;
