import { z } from 'zod';
import { screenSchema, targetAppSchema } from '@carbroz/sdui-engine';

const registryNodeSchema = z.object({
  name: z.string().trim().min(1),
  componentType: z.string().trim().min(1),
  schemaJson: z.record(z.string(), z.unknown()).default({}),
  supportedProperties: z.record(z.string(), z.unknown()).optional(),
  supportedActions: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const createSduiComponentSchema = registryNodeSchema;
export const createSduiSectionSchema = registryNodeSchema;
export const createSduiGroupSchema = registryNodeSchema;
export const createSduiElementSchema = registryNodeSchema;

export type CreateSduiComponentDto = z.infer<typeof createSduiComponentSchema>;
export type CreateSduiSectionDto = z.infer<typeof createSduiSectionSchema>;
export type CreateSduiGroupDto = z.infer<typeof createSduiGroupSchema>;
export type CreateSduiElementDto = z.infer<typeof createSduiElementSchema>;

export const getSduiScreenSchema = z.object({
  screenId: z.string().trim().min(1),
  targetApp: targetAppSchema.default('CUSTOMER'),
}).strict();

export const updateSduiScreenSchema = z.object({
  screenId: z.string().trim().min(1),
  targetApp: targetAppSchema.default('CUSTOMER'),
  isPublished: z.boolean().default(true),
  layoutJson: screenSchema,
}).strict();

export const createSduiDraftSchema = z.object({
  screenId: z.string().trim().min(1),
  targetApp: targetAppSchema.default('CUSTOMER'),
  layoutJson: screenSchema,
  createdFromVersion: z.number().int().positive().optional(),
  changeDescription: z.string().trim().min(1).optional(),
  overwriteExistingDraft: z.boolean().default(false),
}).strict();

export const updateSduiDraftSchema = z.object({
  screenId: z.string().trim().min(1),
  targetApp: targetAppSchema.default('CUSTOMER'),
  layoutJson: screenSchema,
  lockVersion: z.number().int().positive(),
  changeDescription: z.string().trim().min(1).optional(),
}).strict();

export const publishSduiVersionSchema = z.object({
  screenId: z.string().trim().min(1),
  targetApp: targetAppSchema.default('CUSTOMER'),
  versionNumber: z.number().int().positive(),
}).strict();

export const archiveSduiVersionSchema = publishSduiVersionSchema;

export const rollbackSduiVersionSchema = z.object({
  screenId: z.string().trim().min(1),
  targetApp: targetAppSchema.default('CUSTOMER'),
  targetVersionNumber: z.number().int().positive(),
}).strict();

export const compareSduiVersionsSchema = z.object({
  screenId: z.string().trim().min(1),
  targetApp: targetAppSchema.default('CUSTOMER'),
  sourceVersion: z.number().int().positive(),
  targetVersion: z.number().int().positive(),
}).strict();

export type GetSduiScreenDto = z.infer<typeof getSduiScreenSchema>;
export type SduiJsonContractDto = z.infer<typeof screenSchema>;
export type SduiJsonContract = SduiJsonContractDto;
export type UpdateSduiScreenDto = z.infer<typeof updateSduiScreenSchema>;
export type CreateSduiDraftDto = z.infer<typeof createSduiDraftSchema>;
export type UpdateSduiDraftDto = z.infer<typeof updateSduiDraftSchema>;
export type PublishSduiVersionDto = z.infer<typeof publishSduiVersionSchema>;
export type ArchiveSduiVersionDto = z.infer<typeof archiveSduiVersionSchema>;
export type RollbackSduiVersionDto = z.infer<typeof rollbackSduiVersionSchema>;
export type CompareSduiVersionsDto = z.infer<typeof compareSduiVersionsSchema>;
