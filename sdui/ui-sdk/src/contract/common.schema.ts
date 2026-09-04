import { z } from 'zod';

/** Canonical non-empty identifier used by reusable SDUI definitions and instances. */
export const idSchema = z.string().trim().min(1);

/** Canonical non-empty reusable SDUI definition type. */
export const typeSchema = z.string().trim().min(1);

/** Open property bag used only where the owning structural contract permits runtime properties. */
export const propertiesSchema = z.record(z.string(), z.unknown());

/**
 * Canonical runtime action contract emitted by SDUI documents.
 *
 * @remarks
 * Business behavior referenced by an action remains owned by its bounded context;
 * the generic UI SDK only describes the action payload.
 */
export const actionSchema = z.object({
  type: typeSchema,
  targetId: idSchema.optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const actionsSchema = z.record(z.string().min(1), actionSchema);

/**
 * Canonical SDUI runtime publication scopes.
 *
 * `GLOBAL` is reserved for genuinely product-neutral runtime content.
 * `PARTNER` and `CUSTOMER` evolve independently. Admin manages publication but
 * does not consume SDUI for its own rendering and therefore is intentionally
 * not a target scope.
 */
export const targetAppSchema = z.enum(['GLOBAL', 'PARTNER', 'CUSTOMER']);

export type SduiAction = z.infer<typeof actionSchema>;
export type SduiTargetApp = z.infer<typeof targetAppSchema>;
