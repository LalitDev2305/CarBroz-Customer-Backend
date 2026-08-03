import { z } from 'zod';
import { screenSchema } from '@carbroz/ui-sdk';
export const sduiJsonContractSchema = screenSchema;
export const getSduiScreenSchema = z.object({
    screenId: z.string().min(1),
    targetApp: z.enum(['CUSTOMER', 'PARTNER', 'ADMIN']).optional().default('CUSTOMER')
});
export const updateSduiScreenSchema = z.object({
    screenId: z.string().min(1),
    targetApp: z.enum(['CUSTOMER', 'PARTNER', 'ADMIN']).optional().default('CUSTOMER'),
    layoutJson: sduiJsonContractSchema,
    isPublished: z.boolean().optional().default(true)
});
export const registerSduiComponentSchema = z.object({
    name: z.string().min(1),
    nodeLevel: z.enum(['COMPONENT', 'SUBCOMPONENT', 'CHILD', 'CHILDREN_DATA']).optional().default('COMPONENT'),
    componentType: z.string().min(1),
    schemaJson: z.record(z.string(), z.any()),
    supportedProperties: z.array(z.string()).optional(),
    supportedActions: z.array(z.string()).optional()
});
export const upsertSduiTemplateSchema = z.object({
    templateId: z.string().min(1),
    templateType: z.string().min(1),
    defaultLayoutJson: sduiJsonContractSchema
});
//# sourceMappingURL=sdui-registry.dto.js.map