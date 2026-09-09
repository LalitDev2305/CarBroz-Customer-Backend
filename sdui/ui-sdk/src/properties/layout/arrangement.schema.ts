import { z } from 'zod';
import { spacingValueSchema } from './spacing.schema.js';

export const arrangementKeywordSchema = z.enum(['start', 'center', 'end', 'spaceBetween', 'spaceAround', 'spaceEvenly']);
export const spacedByArrangementSchema = z.object({ type: z.literal('spacedBy'), spacing: spacingValueSchema }).strict();
export const arrangementSchema = z.union([arrangementKeywordSchema, spacedByArrangementSchema]);
export type Arrangement = z.infer<typeof arrangementSchema>;
