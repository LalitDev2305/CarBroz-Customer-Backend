import { NotFoundError } from '@carbroz/foundation-kernel';
import type { IUseCase } from '@carbroz/foundation-kernel';
import { parseSduiScreen, type SduiScreen, type SduiTargetApp } from '@carbroz/ui-sdk';
import type {
  ISduiRegistryRepository,
  SduiVersionRecord,
} from '../domain/repositories/ISduiRegistryRepository.js';

export interface CreateSduiComponentInput {
  screenId: string;
  targetApp?: SduiTargetApp;
  component: Record<string, unknown>;
}
export type CreateSduiComponentResult = SduiVersionRecord;

export class CreateSduiComponentUseCase implements IUseCase<CreateSduiComponentInput, CreateSduiComponentResult> {
  constructor(private readonly repository: ISduiRegistryRepository) {}
  async execute(input: CreateSduiComponentInput): Promise<CreateSduiComponentResult> {
    return this.repository.createComponent(input.screenId, input.targetApp ?? 'CUSTOMER', input.component);
  }
}

export interface CreateSduiSectionInput {
  screenId: string;
  targetApp?: SduiTargetApp;
  section: Record<string, unknown>;
}
export type CreateSduiSectionResult = SduiVersionRecord;

export class CreateSduiSectionUseCase implements IUseCase<CreateSduiSectionInput, CreateSduiSectionResult> {
  constructor(private readonly repository: ISduiRegistryRepository) {}
  async execute(input: CreateSduiSectionInput): Promise<CreateSduiSectionResult> {
    return this.repository.createSection(input.screenId, input.targetApp ?? 'CUSTOMER', input.section);
  }
}

export interface CreateSduiGroupInput {
  screenId: string;
  targetApp?: SduiTargetApp;
  group: Record<string, unknown>;
}
export type CreateSduiGroupResult = SduiVersionRecord;

export class CreateSduiGroupUseCase implements IUseCase<CreateSduiGroupInput, CreateSduiGroupResult> {
  constructor(private readonly repository: ISduiRegistryRepository) {}
  async execute(input: CreateSduiGroupInput): Promise<CreateSduiGroupResult> {
    return this.repository.createGroup(input.screenId, input.targetApp ?? 'CUSTOMER', input.group);
  }
}

export interface CreateSduiElementInput {
  screenId: string;
  targetApp?: SduiTargetApp;
  element: Record<string, unknown>;
}
export type CreateSduiElementResult = SduiVersionRecord;

export class CreateSduiElementUseCase implements IUseCase<CreateSduiElementInput, CreateSduiElementResult> {
  constructor(private readonly repository: ISduiRegistryRepository) {}
  async execute(input: CreateSduiElementInput): Promise<CreateSduiElementResult> {
    return this.repository.createElement(input.screenId, input.targetApp ?? 'CUSTOMER', input.element);
  }
}

export interface CreateSduiDraftInput {
  screenId: string;
  targetApp?: SduiTargetApp;
  schemaVersion?: string;
  layout: SduiScreen;
}
export type CreateSduiDraftResult = SduiVersionRecord;

export class CreateSduiDraftUseCase implements IUseCase<CreateSduiDraftInput, CreateSduiDraftResult> {
  constructor(private readonly repository: ISduiRegistryRepository) {}
  async execute(input: CreateSduiDraftInput): Promise<CreateSduiDraftResult> {
    const parsed = parseSduiScreen(input.layout);
    return this.repository.createDraft(
      input.screenId,
      input.targetApp ?? parsed.targetApp,
      input.schemaVersion ?? parsed.schemaVersion,
      parsed,
    );
  }
}

export interface UpdateSduiDraftInput {
  screenId: string;
  targetApp?: SduiTargetApp;
  version: number;
  layout: SduiScreen;
}
export type UpdateSduiDraftResult = SduiVersionRecord;

export class UpdateSduiDraftUseCase implements IUseCase<UpdateSduiDraftInput, UpdateSduiDraftResult> {
  constructor(private readonly repository: ISduiRegistryRepository) {}
  async execute(input: UpdateSduiDraftInput): Promise<UpdateSduiDraftResult> {
    const parsed = parseSduiScreen(input.layout);
    return this.repository.updateDraft(input.screenId, input.targetApp ?? parsed.targetApp, input.version, parsed);
  }
}

export interface PublishSduiVersionInput {
  screenId: string;
  targetApp?: SduiTargetApp;
  version: number;
}
export type PublishSduiVersionResult = SduiVersionRecord;

export class PublishSduiVersionUseCase implements IUseCase<PublishSduiVersionInput, PublishSduiVersionResult> {
  constructor(private readonly repository: ISduiRegistryRepository) {}
  async execute(input: PublishSduiVersionInput): Promise<PublishSduiVersionResult> {
    return this.repository.publishVersion(input.screenId, input.targetApp ?? 'CUSTOMER', input.version);
  }
}

export interface ArchiveSduiVersionInput {
  screenId: string;
  targetApp?: SduiTargetApp;
  version: number;
}
export type ArchiveSduiVersionResult = SduiVersionRecord;

export class ArchiveSduiVersionUseCase implements IUseCase<ArchiveSduiVersionInput, ArchiveSduiVersionResult> {
  constructor(private readonly repository: ISduiRegistryRepository) {}
  async execute(input: ArchiveSduiVersionInput): Promise<ArchiveSduiVersionResult> {
    return this.repository.archiveVersion(input.screenId, input.targetApp ?? 'CUSTOMER', input.version);
  }
}

export interface RollbackSduiVersionInput {
  screenId: string;
  targetApp?: SduiTargetApp;
  version: number;
}
export type RollbackSduiVersionResult = SduiVersionRecord;

export class RollbackSduiVersionUseCase implements IUseCase<RollbackSduiVersionInput, RollbackSduiVersionResult> {
  constructor(private readonly repository: ISduiRegistryRepository) {}
  async execute(input: RollbackSduiVersionInput): Promise<RollbackSduiVersionResult> {
    return this.repository.rollbackVersion(input.screenId, input.targetApp ?? 'CUSTOMER', input.version);
  }
}

export interface GetSduiVersionHistoryInput {
  screenId: string;
  targetApp?: SduiTargetApp;
}
export interface GetSduiVersionHistoryResult {
  screenId: string;
  targetApp: SduiTargetApp;
  versions: SduiVersionRecord[];
}

export class GetSduiVersionHistoryUseCase implements IUseCase<GetSduiVersionHistoryInput, GetSduiVersionHistoryResult> {
  constructor(private readonly repository: ISduiRegistryRepository) {}
  async execute(input: GetSduiVersionHistoryInput): Promise<GetSduiVersionHistoryResult> {
    const targetApp = input.targetApp ?? 'CUSTOMER';
    return {
      screenId: input.screenId,
      targetApp,
      versions: await this.repository.getVersionHistory(input.screenId, targetApp),
    };
  }
}

export interface GetSduiSpecificVersionInput {
  screenId: string;
  targetApp?: SduiTargetApp;
  version: number;
}
export type GetSduiSpecificVersionResult = SduiVersionRecord;

export class GetSduiSpecificVersionUseCase implements IUseCase<GetSduiSpecificVersionInput, GetSduiSpecificVersionResult> {
  constructor(private readonly repository: ISduiRegistryRepository) {}
  async execute(input: GetSduiSpecificVersionInput): Promise<GetSduiSpecificVersionResult> {
    const targetApp = input.targetApp ?? 'CUSTOMER';
    const version = await this.repository.getSpecificVersion(input.screenId, targetApp, input.version);
    if (!version) throw new NotFoundError(`Version ${input.version} not found for screen '${input.screenId}'`);
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
  sourceVersion: SduiVersionRecord;
  targetVersion: SduiVersionRecord;
  comparisonSummary: {
    isIdentical: boolean;
    templateTypeChanged: boolean;
    componentsCountDelta: number;
    sectionsCountDelta: number;
    groupsCountDelta: number;
    elementsCountDelta: number;
  };
}

function countHierarchy(screen: SduiScreen): { components: number; sections: number; groups: number; elements: number } {
  const components = screen.template.components;
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

/** CompareSduiVersionsUseCase is an exported sdui/registry contract/implementation; see the owning README for lifecycle and extension rules. */
export class CompareSduiVersionsUseCase implements IUseCase<CompareSduiVersionsInput, CompareSduiVersionsResult> {
  constructor(private readonly repository: ISduiRegistryRepository) {}
  /** Executes this application operation through its declared ports and domain invariants. */
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
        templateTypeChanged: sourceLayout.template.type !== targetLayout.template.type,
        componentsCountDelta: targetCounts.components - sourceCounts.components,
        sectionsCountDelta: targetCounts.sections - sourceCounts.sections,
        groupsCountDelta: targetCounts.groups - sourceCounts.groups,
        elementsCountDelta: targetCounts.elements - sourceCounts.elements,
      },
    };
  }
}

/** GetSduiScreenInput is an exported sdui/registry contract/implementation; see the owning README for lifecycle and extension rules. */
export interface GetSduiScreenInput { data: { screenId: string; targetApp: SduiTargetApp; }; }
/** GetSduiScreenUseCase is an exported sdui/registry contract/implementation; see the owning README for lifecycle and extension rules. */
export class GetSduiScreenUseCase implements IUseCase<GetSduiScreenInput, SduiScreen> {
  constructor(private readonly repository: ISduiRegistryRepository) {}
  /** Executes this application operation through its declared ports and domain invariants. */
  async execute(input: GetSduiScreenInput): Promise<SduiScreen> {
    const { screenId, targetApp } = input.data;
    const screen = await this.repository.findPublishedScreen(screenId, targetApp);
    if (!screen) throw new NotFoundError(`Published screen '${screenId}' for target '${targetApp}' was not found.`);
    return parseSduiScreen(screen.layoutJson);
  }
}
