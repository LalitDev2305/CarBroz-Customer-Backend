export const CURRENT_SDUI_SCHEMA_VERSION = '3.0';

export function isSupportedSduiSchemaVersion(version: string): boolean {
  return version === CURRENT_SDUI_SCHEMA_VERSION;
}
