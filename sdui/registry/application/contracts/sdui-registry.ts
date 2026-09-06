/**
 * Transport-neutral application input contracts derived from sdui-registry.dto.ts.
 * Zod remains at the API boundary; bounded-context application services depend only on these types.
 */
export type CreateSduiComponentDto = { name: string; componentType: string; schemaJson: Record<string, unknown>; supportedProperties?: Record<string, unknown> | undefined; supportedActions?: Record<string, unknown> | undefined; };
/** CreateSduiSectionDto is an exported sdui/registry contract/implementation; see the owning README for lifecycle and extension rules. */
export type CreateSduiSectionDto = { name: string; componentType: string; schemaJson: Record<string, unknown>; supportedProperties?: Record<string, unknown> | undefined; supportedActions?: Record<string, unknown> | undefined; };
/** CreateSduiGroupDto is an exported sdui/registry contract/implementation; see the owning README for lifecycle and extension rules. */
export type CreateSduiGroupDto = { name: string; componentType: string; schemaJson: Record<string, unknown>; supportedProperties?: Record<string, unknown> | undefined; supportedActions?: Record<string, unknown> | undefined; };
/** CreateSduiElementDto is an exported sdui/registry contract/implementation; see the owning README for lifecycle and extension rules. */
export type CreateSduiElementDto = { name: string; componentType: string; schemaJson: Record<string, unknown>; supportedProperties?: Record<string, unknown> | undefined; supportedActions?: Record<string, unknown> | undefined; };
/** GetSduiScreenDto is an exported sdui/registry contract/implementation; see the owning README for lifecycle and extension rules. */
export type GetSduiScreenDto = { [x: string]: any; screenId: string; };
/** SduiJsonContractDto is an exported sdui/registry contract/implementation; see the owning README for lifecycle and extension rules. */
export type SduiJsonContractDto = any;
/** SduiJsonContract is an exported sdui/registry contract/implementation; see the owning README for lifecycle and extension rules. */
export type SduiJsonContract = any;
/** CreateSduiDraftDto is an exported sdui/registry contract/implementation; see the owning README for lifecycle and extension rules. */
export type CreateSduiDraftDto = { [x: string]: any; screenId: string; overwriteExistingDraft: boolean; createdFromVersion?: number | undefined; changeDescription?: string | undefined; };
/** UpdateSduiDraftDto is an exported sdui/registry contract/implementation; see the owning README for lifecycle and extension rules. */
export type UpdateSduiDraftDto = { [x: string]: any; screenId: string; lockVersion: number; changeDescription?: string | undefined; };
/** PublishSduiVersionDto is an exported sdui/registry contract/implementation; see the owning README for lifecycle and extension rules. */
export type PublishSduiVersionDto = { [x: string]: any; screenId: string; versionNumber: number; };
/** ArchiveSduiVersionDto is an exported sdui/registry contract/implementation; see the owning README for lifecycle and extension rules. */
export type ArchiveSduiVersionDto = { [x: string]: any; screenId: string; versionNumber: number; };
/** RollbackSduiVersionDto is an exported sdui/registry contract/implementation; see the owning README for lifecycle and extension rules. */
export type RollbackSduiVersionDto = { [x: string]: any; screenId: string; targetVersionNumber: number; };
/** CompareSduiVersionsDto is an exported sdui/registry contract/implementation; see the owning README for lifecycle and extension rules. */
export type CompareSduiVersionsDto = { [x: string]: any; screenId: string; sourceVersion: number; targetVersion: number; };
