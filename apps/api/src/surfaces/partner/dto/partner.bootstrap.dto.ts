import { z } from 'zod';

const partnerPlatformSchema = z.preprocess(
  (value) => typeof value === 'string' ? value.toUpperCase() : value,
  z.enum(['ANDROID', 'IOS']),
);

/** Transport-only validation for Partner bootstrap client metadata. */
export const partnerBootstrapHeadersSchema = z.object({
  'x-carbroz-platform': partnerPlatformSchema,
  'x-carbroz-app-version': z.string().trim().regex(/^\d+(?:\.\d+)*$/),
  'x-carbroz-build-number': z.coerce.number().int().nonnegative(),
}).passthrough();
