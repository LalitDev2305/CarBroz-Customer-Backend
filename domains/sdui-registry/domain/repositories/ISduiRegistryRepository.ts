import type { SduiScreen, SduiTargetApp } from '@carbroz/sdui-engine';
import type { SduiComponentEntity } from '../SduiComponent.js';
import type { SduiElementEntity } from '../SduiElement.js';
import type { SduiGroupEntity } from '../SduiGroup.js';
import type { SduiScreenEntity } from '../SduiScreen.js';
import type { SduiSectionEntity } from '../SduiSection.js';
import type { SduiTemplateEntity } from '../SduiTemplate.js';

export interface CreateDraftInput {
  screenId: string;
  targetApp?: SduiTargetApp;
  layoutJson: SduiScreen;
  createdFromVersion?: number;
  changeDescription?: string;
  overwriteExistingDraft?: boolean;
}

export interface UpdateDraftInput {
  screenId: string;
  targetApp?: SduiTargetApp;
  layoutJson: SduiScreen;
  lockVersion: number;
  changeDescription?: string;
}

export interface RegistryNodeInput {
  name: string;
  componentType: string;
  schemaJson: unknown;
  supportedProperties?: unknown;
  supportedActions?: unknown;
}

export interface ISduiRegistryRepository {
  findPublishedScreen(screenId: string, targetApp?: SduiTargetApp): Promise<SduiScreenEntity | null>;
  upsertScreen(
    screenId: string,
    targetApp: SduiTargetApp,
    layoutJson: SduiScreen,
    isPublished?: boolean,
  ): Promise<SduiScreenEntity>;

  createDraft(input: CreateDraftInput): Promise<SduiScreenEntity>;
  updateDraft(input: UpdateDraftInput): Promise<SduiScreenEntity>;
  publishVersion(
    screenId: string,
    targetApp: SduiTargetApp,
    versionNumber: number,
    publishedBy: string,
  ): Promise<SduiScreenEntity>;
  archiveVersion(screenId: string, targetApp: SduiTargetApp, versionNumber: number): Promise<SduiScreenEntity>;
  rollbackVersion(
    screenId: string,
    targetApp: SduiTargetApp,
    targetVersionNumber: number,
    publishedBy: string,
  ): Promise<SduiScreenEntity>;
  getVersionHistory(screenId: string, targetApp?: SduiTargetApp): Promise<SduiScreenEntity[]>;
  getSpecificVersion(
    screenId: string,
    targetApp: SduiTargetApp,
    versionNumber: number,
  ): Promise<SduiScreenEntity | null>;
  findDraft(screenId: string, targetApp?: SduiTargetApp): Promise<SduiScreenEntity | null>;

  getTemplate(templateId: string): Promise<SduiTemplateEntity | null>;
  upsertTemplate(templateId: string, templateType: string, defaultLayoutJson: SduiScreen['template']): Promise<SduiTemplateEntity>;

  createComponent(input: RegistryNodeInput): Promise<SduiComponentEntity>;
  getComponent(name: string): Promise<SduiComponentEntity | null>;
  listComponents(): Promise<SduiComponentEntity[]>;

  createSection(input: RegistryNodeInput): Promise<SduiSectionEntity>;
  getSection(name: string): Promise<SduiSectionEntity | null>;
  listSections(): Promise<SduiSectionEntity[]>;

  createGroup(input: RegistryNodeInput): Promise<SduiGroupEntity>;
  getGroup(name: string): Promise<SduiGroupEntity | null>;
  listGroups(): Promise<SduiGroupEntity[]>;

  createElement(input: RegistryNodeInput): Promise<SduiElementEntity>;
  getElement(name: string): Promise<SduiElementEntity | null>;
  listElements(): Promise<SduiElementEntity[]>;
}
