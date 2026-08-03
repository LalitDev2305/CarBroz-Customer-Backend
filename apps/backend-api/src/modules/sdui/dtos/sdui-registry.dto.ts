import { z } from 'zod';
import { screenSchema } from '@carbroz/ui-sdk';

export const sduiJsonContractSchema = screenSchema;
export type SduiJsonContract = z.infer<typeof sduiJsonContractSchema>;

export const getSduiScreenSchema = z.object({
  screenId: z.string().min(1),
  targetApp: z.enum(['CUSTOMER', 'PARTNER', 'ADMIN']).optional().default('CUSTOMER')
});

export type GetSduiScreenDto = z.input<typeof getSduiScreenSchema>;

export const updateSduiScreenSchema = z.object({
  screenId: z.string().min(1),
  targetApp: z.enum(['CUSTOMER', 'PARTNER', 'ADMIN']).optional().default('CUSTOMER'),
  layoutJson: sduiJsonContractSchema,
  isPublished: z.boolean().optional().default(true)
});

export type UpdateSduiScreenDto = z.input<typeof updateSduiScreenSchema>;

export const registerSduiComponentSchema = z.object({
  name: z.string().min(1),
  nodeLevel: z.enum(['COMPONENT', 'SUBCOMPONENT', 'CHILD', 'CHILDREN_DATA']).optional().default('COMPONENT'),
  componentType: z.string().min(1),
  schemaJson: z.record(z.string(), z.any()),
  supportedProperties: z.array(z.string()).optional(),
  supportedActions: z.array(z.string()).optional()
});

export type RegisterSduiComponentDto = z.input<typeof registerSduiComponentSchema>;

export const upsertSduiTemplateSchema = z.object({
  templateId: z.string().min(1),
  templateType: z.string().min(1),
  defaultLayoutJson: sduiJsonContractSchema
});

export type UpsertSduiTemplateDto = z.input<typeof upsertSduiTemplateSchema>;
