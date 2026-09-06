export const CURRENT_SDUI_SCHEMA_VERSION = '3.0';

/** isSupportedSduiSchemaVersion is an exported sdui/ui-sdk contract/implementation; see the owning README for lifecycle and extension rules. */
export function isSupportedSduiSchemaVersion(version: string): boolean {
  return version === CURRENT_SDUI_SCHEMA_VERSION;
}
