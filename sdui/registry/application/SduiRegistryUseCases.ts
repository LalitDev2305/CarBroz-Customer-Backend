import {
  ForbiddenError,
  NotFoundError,
  type ExecutionContext,
  type IUseCase,
} from '@carbroz/foundation-kernel';
import { parseSduiScreen, type SduiScreen, type SduiTargetApp } from '@carbroz/ui-sdk';
import type { SduiComponentEntity } from '../domain/SduiComponent.js';
import type { SduiElementEntity } from '../domain/SduiElement.js';
import type { SduiGroupEntity } from '../domain/SduiGroup.js';
import type { SduiScreenEntity } from '../domain/SduiScreen.js';
import type { SduiSectionEntity } from '../domain/SduiSection.js';
import type {
  CreateDraftInput,
  ISduiRegistryRepository,
  RegistryNodeInput,
  UpdateDraftInput,
} from '../domain/repositories/ISduiRegistryRepository.js';

function assertAdmin(context: ExecutionContext): void {
  const actor = context.actor;
  if (!actor || (actor.kind !== 'ADMIN' && !actor.roles.includes('ADMIN'))) {
    throw new ForbiddenError('Administrator privileges are required for this SDUI operation');
  }
}

function publisherIdentity(context: ExecutionContext): string {
  assertAdmin(context);
  return `user-${String(context.actor!.id)}`;
}

export interface RegistryNodeCommandInput {
  context: ExecutionContext;
  data: RegistryNodeInput;
}

export class CreateSduiComponentUseCase implements IUseCase<RegistryNodeCommandInput, SduiComponentEntity> {
  constructor(private readonly repository: ISduiRegistryRepository) {}
  async execute(input: RegistryNodeCommandInput): Promise<SduiComponentEntity> {
    assertAdmin(input.context);
    return this.repository.createComponent(input.data);
  }
}

export class CreateSduiSectionUseCase implements IUseCase<RegistryNodeCommandInput, SduiSectionEntity> {
  constructor(private readonly repository: ISduiRegistryRepository) {}
  async execute(input: RegistryNodeCommandInput): Promise<SduiSectionEntity> {
    assertAdmin(input.context);
    return this.repository.createSection(input.data);
  }
}

export class CreateSduiGroupUseCase implements IUseCase<RegistryNodeCommandInput, SduiGroupEntity> {
  constructor(private readonly repository: ISduiRegistryRepository) {}
  async execute(input: RegistryNodeCommandInput): Promise<SduiGroupEntity> {
    assertAdmin(input.context);
    return this.repository.createGroup(input.data);
  }
}

export class CreateSduiElementUseCase implements IUseCase<RegistryNodeCommandInput, SduiElementEntity> {
  constructor(private readonly repository: ISduiRegistryRepository) {}
  async execute(input: RegistryNodeCommandInput): Promise<SduiElementEntity> {
    assertAdmin(input.context);
    return this.repository.createElement(input.data);
  }
}

export interface CreateSduiDraftInput { context: ExecutionContext; data: CreateDraftInput; }
export class CreateSduiDraftUseCase implements IUseCase<CreateSduiDraftInput, SduiScreenEntity> {
  constructor(private readonly repository: ISduiRegistryRepository) {}
  async execute(input: CreateSduiDraftInput): Promise<SduiScreenEntity> {
    assertAdmin(input.context);
    return this.repository.createDraft(input.data);
  }
}

export interface UpdateSduiDraftInput { context: ExecutionContext; data: UpdateDraftInput; }
export class UpdateSduiDraftUseCase implements IUseCase<UpdateSduiDraftInput, SduiScreenEntity> {
  constructor(private readonly repository: ISduiRegistryRepository) {}
  async execute(input: UpdateSduiDraftInput): Promise<SduiScreenEntity> {
    assertAdmin(input.context);
    return this.repository.updateDraft(input.data);
  }
}

export interface PublishSduiVersionRequest { screenId: string; targetApp?: SduiTargetApp; versionNumber: number; }
export interface PublishSduiVersionInput { context: ExecutionContext; data: PublishSduiVersionRequest; }
export class PublishSduiVersionUseCase implements IUseCase<PublishSduiVersionInput, SduiScreenEntity> {
  constructor(private readonly repository: ISduiRegistryRepository) {}
  async execute(input: PublishSduiVersionInput): Promise<SduiScreenEntity> {
    const publishedBy = publisherIdentity(input.context);
    const { screenId, targetApp = 'CUSTOMER', versionNumber } = input.data;
    return this.repository.publishVersion(screenId, targetApp, versionNumber, publishedBy);
  }
}

export interface ArchiveSduiVersionRequest { screenId: string; targetApp?: SduiTargetApp; versionNumber: number; }
export interface ArchiveSduiVersionInput { context: ExecutionContext; data: ArchiveSduiVersionRequest; }
export class ArchiveSduiVersionUseCase implements IUseCase<ArchiveSduiVersionInput, SduiScreenEntity> {
  constructor(private readonly repository: ISduiRegistryRepository) {}
  async execute(input: ArchiveSduiVersionInput): Promise<SduiScreenEntity> {
    assertAdmin(input.context);
    const { screenId, targetApp = 'CUSTOMER', versionNumber } = input.data;
    return this.repository.archiveVersion(screenId, targetApp, versionNumber);
  }
}

export interface RollbackSduiVersionRequest { screenId: string; targetApp?: SduiTargetApp; targetVersionNumber: number; }
export interface RollbackSduiVersionInput { context: ExecutionContext; data: RollbackSduiVersionRequest; }
export class RollbackSduiVersionUseCase implements IUseCase<RollbackSduiVersionInput, SduiScreenEntity> {
  constructor(private readonly repository: ISduiRegistryRepository) {}
  async execute(input: RollbackSduiVersionInput): Promise<SduiScreenEntity> {
    const publishedBy = publisherIdentity(input.context);
    const { screenId, targetApp = 'CUSTOMER', targetVersionNumber } = input.data;
    return this.repository.rollbackVersion(screenId, targetApp, targetVersionNumber, publishedBy);
  }
}

export interface GetSduiVersionHistoryInput { screenId: string; targetApp?: SduiTargetApp; }
export class GetSduiVersionHistoryUseCase implements IUseCase<GetSduiVersionHistoryInput, SduiScreenEntity[]> {
  constructor(private readonly repository: ISduiRegistryRepository) {}
  async execute(input: GetSduiVersionHistoryInput): Promise<SduiScreenEntity[]> {
    return this.repository.getVersionHistory(input.screenId, input.targetApp);
  }
}

export interface GetSduiSpecificVersionInput { screenId: string; targetApp?: SduiTargetApp; versionNumber: number; }
export class GetSduiSpecificVersionUseCase implements IUseCase<GetSduiSpecificVersionInput, SduiScreenEntity> {
  constructor(private readonly repository: ISduiRegistryRepository) {}
  async execute(input: GetSduiSpecificVersionInput): Promise<SduiScreenEntity> {
    const targetApp = input.targetApp ?? 'CUSTOMER';
    const version = await this.repository.getSpecificVersion(input.screenId, targetApp, input.versionNumber);
    if (!version) throw new NotFoundError(`SDUI version ${input.versionNumber} not found for screen '${input.screenId}'`);
    return version;
  }
}

export interface CompareSduiVersionsInput {
  screenId: string;
  targetApp?: SduiTargetApp;
  sourceVersion: number;
  targetVersion: number;
}
export interface CompareSduiVersionsResult {
  screenId: string;
  targetApp: SduiTargetApp;
  sourceVersion: SduiScreenEntity;
  targetVersion: SduiScreenEntity;
  comparisonSummary: {
    isIdentical: boolean;
    templateTypeChanged: boolean;
    componentsCountDelta: number;
    sectionsCountDelta: number;
    groupsCountDelta: number;
    elementsCountDelta: number;
  };
}

function countHierarchy(layout: SduiScreen) {
  const components = layout.template.components;
  let sections = 0;
  let groups = 0;
  let elements = 0;
  for (const component of components) {
    if ('elements' in component && Array.isArray(component.elements)) elements += component.elements.length;
    const componentSections = 'sections' in component && Array.isArray(component.sections) ? component.sections : [];
    sections += componentSections.length;
    for (const section of componentSections) {
      if ('elements' in section && Array.isArray(section.elements)) elements += section.elements.length;
      const sectionGroups = 'groups' in section && Array.isArray(section.groups) ? section.groups : [];
      groups += sectionGroups.length;
      for (const group of sectionGroups) elements += group.elements.length;
    }
  }
  return { components: components.length, sections, groups, elements };
}

export class CompareSduiVersionsUseCase implements IUseCase<CompareSduiVersionsInput, CompareSduiVersionsResult> {
  constructor(private readonly repository: ISduiRegistryRepository) {}
  async execute(input: CompareSduiVersionsInput): Promise<CompareSduiVersionsResult> {
    const targetApp = input.targetApp ?? 'CUSTOMER';
    const sourceVersion = await this.repository.getSpecificVersion(input.screenId, targetApp, input.sourceVersion);
    if (!sourceVersion) throw new NotFoundError(`Source version ${input.sourceVersion} not found for screen '${input.screenId}'`);
    const targetVersion = await this.repository.getSpecificVersion(input.screenId, targetApp, input.targetVersion);
    if (!targetVersion) throw new NotFoundError(`Target version ${input.targetVersion} not found for screen '${input.screenId}'`);
    const sourceLayout = parseSduiScreen(sourceVersion.layoutJson);
    const targetLayout = parseSduiScreen(targetVersion.layoutJson);
    const sourceCounts = countHierarchy(sourceLayout);
    const targetCounts = countHierarchy(targetLayout);
    return {
      screenId: input.screenId,
      targetApp,
      sourceVersion,
      targetVersion,
      comparisonSummary: {
        isIdentical: JSON.stringify(sourceLayout) === JSON.stringify(targetLayout),
        templateTypeChanged: sourceLayout.templateType !== targetLayout.templateType,
        componentsCountDelta: targetCounts.components - sourceCounts.components,
        sectionsCountDelta: targetCounts.sections - sourceCounts.sections,
        groupsCountDelta: targetCounts.groups - sourceCounts.groups,
        elementsCountDelta: targetCounts.elements - sourceCounts.elements,
      },
    };
  }
}

export interface GetSduiScreenInput { data: { screenId: string; targetApp: SduiTargetApp; }; }
export class GetSduiScreenUseCase implements IUseCase<GetSduiScreenInput, SduiScreen> {
  constructor(private readonly repository: ISduiRegistryRepository) {}
  async execute(input: GetSduiScreenInput): Promise<SduiScreen> {
    const { screenId, targetApp } = input.data;
    const screen = await this.repository.findPublishedScreen(screenId, targetApp);
    if (!screen) throw new NotFoundError(`Published screen '${screenId}' for target '${targetApp}' was not found.`);
    return parseSduiScreen(screen.layoutJson);
  }
}
