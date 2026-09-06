import type { SduiScreen, SduiTargetApp } from '@carbroz/ui-sdk';

/** Transport-neutral reusable registry node definition input. */
export interface SduiRegistryNodeInput {
  name: string;
  componentType: string;
  schemaJson: Record<string, unknown>;
  supportedProperties?: Record<string, unknown>;
  supportedActions?: Record<string, unknown>;
}

export type CreateSduiComponentDto = SduiRegistryNodeInput;
export type CreateSduiSectionDto = SduiRegistryNodeInput;
export type CreateSduiGroupDto = SduiRegistryNodeInput;
export type CreateSduiElementDto = SduiRegistryNodeInput;

export interface GetSduiScreenDto {
  screenId: string;
  targetApp: SduiTargetApp;
}

export type SduiJsonContract = SduiScreen;

export interface CreateSduiDraftDto {
  screenId: string;
  targetApp: SduiTargetApp;
  layoutJson: SduiScreen;
  createdFromVersion?: number;
  changeDescription?: string;
  overwriteExistingDraft: boolean;
}

export interface UpdateSduiDraftDto {
  screenId: string;
  targetApp: SduiTargetApp;
  layoutJson: SduiScreen;
  lockVersion: number;
  changeDescription?: string;
}

export interface PublishSduiVersionDto {
  screenId: string;
  targetApp: SduiTargetApp;
  versionNumber: number;
}

export type ArchiveSduiVersionDto = PublishSduiVersionDto;

export interface RollbackSduiVersionDto {
  screenId: string;
  targetApp: SduiTargetApp;
  targetVersionNumber: number;
}

export interface CompareSduiVersionsDto {
  screenId: string;
  targetApp: SduiTargetApp;
  sourceVersion: number;
  targetVersion: number;
}
