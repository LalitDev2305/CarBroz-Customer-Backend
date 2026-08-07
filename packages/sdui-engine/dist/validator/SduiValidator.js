import { z } from 'zod';
export const childrenDataSchema = z.object({
    id: z.string().min(1),
    type: z.string().min(1),
    properties: z.record(z.string(), z.any()).optional(),
    action: z.union([z.record(z.string(), z.any()), z.any()]).optional(),
    analytics: z.record(z.string(), z.any()).optional(),
}).passthrough();
export const childSchema = z.object({
    id: z.string().min(1),
    type: z.string().min(1),
    properties: z.record(z.string(), z.any()).optional(),
    childrenData: z.array(childrenDataSchema).optional(),
}).passthrough();
export const subcomponentSchema = z.object({
    id: z.string().min(1),
    type: z.string().min(1),
    properties: z.record(z.string(), z.any()).optional(),
    children: z.array(childSchema).optional(),
}).passthrough();
export const componentSchema = z.object({
    id: z.string().min(1),
    type: z.string().min(1),
    properties: z.record(z.string(), z.any()).optional(),
    action: z.union([z.record(z.string(), z.any()), z.any()]).optional(),
    subComponents: z.array(subcomponentSchema).optional(),
    subcomponents: z.array(subcomponentSchema).optional(),
    children: z.array(childSchema).optional(),
    childrenData: z.array(childrenDataSchema).optional(),
}).passthrough();
export const templateSchema = z.object({
    id: z.string().optional(),
    type: z.string().optional(),
    properties: z.record(z.string(), z.any()).optional(),
    components: z.array(componentSchema).optional(),
}).passthrough();
export const themeSchema = z.object({
    theme: z.enum(['light', 'dark']).optional(),
    showBackButton: z.boolean().optional(),
    statusBar: z.string().optional(),
    backgroundGradient: z.any().optional(),
}).passthrough();
export const screenSchema = z.object({
    screenId: z.string().min(1),
    templateId: z.string().min(1),
    templateType: z.string().min(1),
    template: templateSchema,
    components: z.array(componentSchema).optional(),
    subcomponents: z.array(subcomponentSchema).optional(),
    children: z.array(childSchema).optional(),
    childrenData: z.array(childrenDataSchema).optional(),
    theme: themeSchema.optional(),
}).passthrough();
export class SduiValidator {
    static validateScreen(screen) {
        return screenSchema.safeParse(screen).success;
    }
}
//# sourceMappingURL=SduiValidator.js.map