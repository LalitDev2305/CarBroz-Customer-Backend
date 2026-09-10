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

/** CreateSduiComponentDto is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export type CreateSduiComponentDto = z.infer<typeof createSduiComponentSchema>;
/** CreateSduiSectionDto is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export type CreateSduiSectionDto = z.infer<typeof createSduiSectionSchema>;
/** CreateSduiGroupDto is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export type CreateSduiGroupDto = z.infer<typeof createSduiGroupSchema>;
/** CreateSduiElementDto is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export type CreateSduiElementDto = z.infer<typeof createSduiElementSchema>;

export const getSduiScreenSchema = z.object({
  screenId: z.string().trim().min(1),
  targetApp: targetAppSchema.default('CUSTOMER'),
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

/** GetSduiScreenDto is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export type GetSduiScreenDto = z.infer<typeof getSduiScreenSchema>;
/** SduiJsonContractDto is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export type SduiJsonContractDto = z.infer<typeof screenSchema>;
/** SduiJsonContract is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export type SduiJsonContract = SduiJsonContractDto;
/** CreateSduiDraftDto is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export type CreateSduiDraftDto = z.infer<typeof createSduiDraftSchema>;
/** UpdateSduiDraftDto is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export type UpdateSduiDraftDto = z.infer<typeof updateSduiDraftSchema>;
/** PublishSduiVersionDto is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export type PublishSduiVersionDto = z.infer<typeof publishSduiVersionSchema>;
/** ArchiveSduiVersionDto is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export type ArchiveSduiVersionDto = z.infer<typeof archiveSduiVersionSchema>;
/** RollbackSduiVersionDto is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export type RollbackSduiVersionDto = z.infer<typeof rollbackSduiVersionSchema>;
/** CompareSduiVersionsDto is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export type CompareSduiVersionsDto = z.infer<typeof compareSduiVersionsSchema>;
