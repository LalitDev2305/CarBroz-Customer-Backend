import { z } from 'zod';
export const createSduiComponentSchema = z.object({
    name: z.string().min(1),
    componentType: z.string().min(1),
    schemaJson: z.record(z.string(), z.any()).default({}),
    supportedProperties: z.record(z.string(), z.any()).optional(),
    supportedActions: z.record(z.string(), z.any()).optional(),
});
export const createSduiSubcomponentSchema = z.object({
    name: z.string().min(1),
    componentType: z.string().min(1),
    schemaJson: z.record(z.string(), z.any()).default({}),
    supportedProperties: z.record(z.string(), z.any()).optional(),
    supportedActions: z.record(z.string(), z.any()).optional(),
});
export const createSduiChildSchema = z.object({
    name: z.string().min(1),
    componentType: z.string().min(1),
    schemaJson: z.record(z.string(), z.any()).default({}),
    supportedProperties: z.record(z.string(), z.any()).optional(),
    supportedActions: z.record(z.string(), z.any()).optional(),
});
export const createSduiChildrenDataSchema = z.object({
    name: z.string().min(1),
    componentType: z.string().min(1),
    schemaJson: z.record(z.string(), z.any()).default({}),
    supportedProperties: z.record(z.string(), z.any()).optional(),
    supportedActions: z.record(z.string(), z.any()).optional(),
});
// Aliases for backwards compatibility
export const registerSduiComponentSchema = createSduiComponentSchema;
export const registerSduiSubcomponentSchema = createSduiSubcomponentSchema;
export const registerSduiChildSchema = createSduiChildSchema;
export const registerSduiChildrenDataSchema = createSduiChildrenDataSchema;
// Phase 14 Layout JSON & Versioning Schemas
export const sduiChildrenDataSchema = z.object({
    dataId: z.string().min(1),
    dataType: z.string().min(1),
    value: z.any().optional(),
    properties: z.record(z.string(), z.any()).optional(),
});
export const sduiChildSchema = z.object({
    childId: z.string().min(1),
    childType: z.string().min(1),
    properties: z.record(z.string(), z.any()).optional(),
    childrenData: z.array(sduiChildrenDataSchema).optional(),
});
export const sduiSubcomponentSchema = z.object({
    subcomponentId: z.string().min(1),
    subcomponentType: z.string().min(1),
    properties: z.record(z.string(), z.any()).optional(),
    children: z.array(sduiChildSchema).optional(),
});
export const sduiComponentSchema = z.object({
    componentId: z.string().min(1),
    componentType: z.string().min(1),
    properties: z.record(z.string(), z.any()).optional(),
    subcomponents: z.array(sduiSubcomponentSchema).optional(),
});
export const sduiTemplateSchema = z.object({
    id: z.string().min(1),
    type: z.string().min(1),
    properties: z.record(z.string(), z.any()).optional(),
    components: z.array(sduiComponentSchema).optional(),
});
export const sduiJsonContractSchema = z.object({
    screenId: z.string().min(1),
    templateId: z.string().min(1),
    templateType: z.string().min(1),
    theme: z.record(z.string(), z.any()).optional(),
    template: sduiTemplateSchema,
});
export const getSduiScreenSchema = z.object({
    screenId: z.string().min(1),
    targetApp: z.string().optional().default('CUSTOMER'),
});
export const updateSduiScreenSchema = z.object({
    screenId: z.string().min(1),
    targetApp: z.string().optional().default('CUSTOMER'),
    isPublished: z.boolean().optional().default(true),
    layoutJson: sduiJsonContractSchema,
});
export const createSduiDraftSchema = z.object({
    screenId: z.string().min(1),
    targetApp: z.string().optional().default('CUSTOMER'),
    layoutJson: sduiJsonContractSchema,
    createdFromVersion: z.number().int().positive().optional(),
    changeDescription: z.string().optional(),
    overwriteExistingDraft: z.boolean().optional().default(false),
});
export const updateSduiDraftSchema = z.object({
    screenId: z.string().min(1),
    targetApp: z.string().optional().default('CUSTOMER'),
    layoutJson: sduiJsonContractSchema,
    lockVersion: z.number().int().positive(),
    changeDescription: z.string().optional(),
});
export const publishSduiVersionSchema = z.object({
    screenId: z.string().min(1),
    targetApp: z.string().optional().default('CUSTOMER'),
    versionNumber: z.number().int().positive(),
});
export const archiveSduiVersionSchema = z.object({
    screenId: z.string().min(1),
    targetApp: z.string().optional().default('CUSTOMER'),
    versionNumber: z.number().int().positive(),
});
export const rollbackSduiVersionSchema = z.object({
    screenId: z.string().min(1),
    targetApp: z.string().optional().default('CUSTOMER'),
    targetVersionNumber: z.number().int().positive(),
});
export const compareSduiVersionsSchema = z.object({
    screenId: z.string().min(1),
    targetApp: z.string().optional().default('CUSTOMER'),
    sourceVersion: z.number().int().positive(),
    targetVersion: z.number().int().positive(),
});
//# sourceMappingURL=sdui-registry.dto.js.map