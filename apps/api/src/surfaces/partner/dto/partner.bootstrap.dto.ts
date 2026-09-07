import { z } from 'zod';

const partnerPlatformSchema = z.preprocess(
  (value) => typeof value === 'string' ? value.toUpperCase() : value,
  z.enum(['ANDROID', 'IOS', 'DESKTOP']),
);

const applicationVersionSchema = z.string().trim().regex(
  /^\d+(?:\.\d+)*(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/,
);

/** Transport-only validation for Partner bootstrap client metadata. */
export const partnerBootstrapHeadersSchema = z.object({
  'x-carbroz-platform': partnerPlatformSchema,
  'x-carbroz-app-version': applicationVersionSchema,
  'x-carbroz-build-number': z.coerce.number().int().nonnegative(),
}).passthrough();
