import { SduiScreenEntity } from '../SduiScreen.js';
import { SduiTemplateEntity } from '../SduiTemplate.js';
import { SduiComponentEntity } from '../SduiComponent.js';
import { SduiSubcomponentEntity } from '../SduiSubcomponent.js';
import { SduiChildEntity } from '../SduiChild.js';
import { SduiChildrenDataEntity } from '../SduiChildrenData.js';

export interface CreateDraftInput {
  screenId: string;
  targetApp?: string;
  layoutJson: any;
  createdFromVersion?: number;
  changeDescription?: string;
  overwriteExistingDraft?: boolean;
}

export interface UpdateDraftInput {
  screenId: string;
  targetApp?: string;
  layoutJson: any;
  lockVersion: number;
  changeDescription?: string;
}

export interface ISduiRegistryRepository {
  findPublishedScreen(screenId: string, targetApp?: string): Promise<SduiScreenEntity | null>;
  upsertScreen(screenId: string, targetApp: string, layoutJson: any, isPublished?: boolean): Promise<SduiScreenEntity>;
  
  // Phase 14 Versioning Operations
  createDraft(input: CreateDraftInput): Promise<SduiScreenEntity>;
  updateDraft(input: UpdateDraftInput): Promise<SduiScreenEntity>;
  publishVersion(screenId: string, targetApp: string, versionNumber: number, publishedBy: string): Promise<SduiScreenEntity>;
  archiveVersion(screenId: string, targetApp: string, versionNumber: number): Promise<SduiScreenEntity>;
  rollbackVersion(screenId: string, targetApp: string, targetVersionNumber: number, publishedBy: string): Promise<SduiScreenEntity>;
  getVersionHistory(screenId: string, targetApp?: string): Promise<SduiScreenEntity[]>;
  getSpecificVersion(screenId: string, targetApp: string, versionNumber: number): Promise<SduiScreenEntity | null>;
  findDraft(screenId: string, targetApp?: string): Promise<SduiScreenEntity | null>;
  
  getTemplate(templateId: string): Promise<SduiTemplateEntity | null>;
  upsertTemplate(templateId: string, templateType: string, defaultLayoutJson: any): Promise<SduiTemplateEntity>;
  
  // Component Node Operations (Renamed to create*)
  createComponent(name: string, componentType: string, schemaJson: any, nodeLevel?: string, supportedProperties?: any, supportedActions?: any): Promise<SduiComponentEntity>;
  registerComponent(name: string, componentType: string, schemaJson: any, nodeLevel?: string, supportedProperties?: any, supportedActions?: any): Promise<SduiComponentEntity>;
  getComponent(name: string): Promise<SduiComponentEntity | null>;
  listComponents(): Promise<SduiComponentEntity[]>;

  // Subcomponent Node Operations
  createSubcomponent(name: string, componentType: string, schemaJson: any, supportedProperties?: any, supportedActions?: any): Promise<SduiSubcomponentEntity>;
  getSubcomponent(name: string): Promise<SduiSubcomponentEntity | null>;
  listSubcomponents(): Promise<SduiSubcomponentEntity[]>;

  // Child Node Operations
  createChild(name: string, componentType: string, schemaJson: any, supportedProperties?: any, supportedActions?: any): Promise<SduiChildEntity>;
  getChild(name: string): Promise<SduiChildEntity | null>;
  listChildren(): Promise<SduiChildEntity[]>;

  // ChildrenData Node Operations
  createChildrenData(name: string, componentType: string, schemaJson: any, supportedProperties?: any, supportedActions?: any): Promise<SduiChildrenDataEntity>;
  getChildrenData(name: string): Promise<SduiChildrenDataEntity | null>;
  listChildrenData(): Promise<SduiChildrenDataEntity[]>;
}
