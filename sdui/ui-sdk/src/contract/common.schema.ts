import { z } from 'zod';

/** Canonical non-empty identifier used by reusable SDUI definitions and instances. */
export const idSchema = z.string().trim().min(1);

/** Canonical non-empty reusable SDUI definition type. */
export const typeSchema = z.string().trim().min(1);

/** Open property bag used only where the owning structural contract permits runtime properties. */
export const propertiesSchema = z.record(z.string(), z.unknown());

/**
 * Canonical SDUI runtime publication scopes.
 *
 * `GLOBAL` is reserved for genuinely product-neutral runtime content.
 * `PARTNER` and `CUSTOMER` evolve independently. Admin manages publication but
 * does not consume SDUI for its own rendering and therefore is intentionally
 * not a target scope.
 */
export const targetAppSchema = z.enum(['GLOBAL', 'PARTNER', 'CUSTOMER']);

/** SduiTargetApp is an exported sdui/ui-sdk contract/implementation; see the owning README for lifecycle and extension rules. */
export type SduiTargetApp = z.infer<typeof targetAppSchema>;
