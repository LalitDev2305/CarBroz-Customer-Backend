import { z } from 'zod';

export const horizontalAlignmentSchema = z.enum(['start', 'center', 'end', 'stretch']);
export const verticalAlignmentSchema = z.enum(['top', 'center', 'bottom', 'stretch']);
export const textAlignmentSchema = z.enum(['start', 'center', 'end', 'justify']);

export type HorizontalAlignment = z.infer<typeof horizontalAlignmentSchema>;
export type VerticalAlignment = z.infer<typeof verticalAlignmentSchema>;
export type TextAlignment = z.infer<typeof textAlignmentSchema>;
