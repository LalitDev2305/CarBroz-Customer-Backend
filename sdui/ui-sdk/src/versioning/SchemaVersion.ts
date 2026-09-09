export const CURRENT_SDUI_SCHEMA_VERSION = '3.0.0' as const;

/**
 * 3.0 is retained only for backward compatibility with already persisted documents.
 * All newly authored production screens use the canonical semantic version 3.0.0.
 */
export const SUPPORTED_SDUI_SCHEMA_VERSIONS = Object.freeze(['3.0.0', '3.0'] as const);

export function isSupportedSduiSchemaVersion(version: string): boolean {
  return (SUPPORTED_SDUI_SCHEMA_VERSIONS as readonly string[]).includes(version);
}
