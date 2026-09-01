import { ISduiRegistryRepository, IUseCase, NotFoundError, SduiScreenEntity } from '@carbroz/common';
import { CompareSduiVersionsDto } from '../dtos/sdui-registry.dto.js';

export interface CompareSduiVersionsResult {
  screenId: string;
  targetApp: string;
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

function countHierarchy(layout: any) {
  const components = Array.isArray(layout?.template?.components) ? layout.template.components : [];
  let sections = 0;
  let groups = 0;
  let elements = 0;

  for (const component of components) {
    if (Array.isArray(component?.elements)) elements += component.elements.length;
    const componentSections = Array.isArray(component?.sections) ? component.sections : [];
    sections += componentSections.length;

    for (const section of componentSections) {
      if (Array.isArray(section?.elements)) elements += section.elements.length;
      const sectionGroups = Array.isArray(section?.groups) ? section.groups : [];
      groups += sectionGroups.length;
      for (const group of sectionGroups) {
        if (Array.isArray(group?.elements)) elements += group.elements.length;
      }
    }
  }

  return { components: components.length, sections, groups, elements };
}

export class CompareSduiVersionsUseCase implements IUseCase<CompareSduiVersionsDto, CompareSduiVersionsResult> {
  constructor(private readonly sduiRegistryRepository: ISduiRegistryRepository) {}

  public async execute(input: CompareSduiVersionsDto): Promise<CompareSduiVersionsResult> {
    const { screenId, targetApp = 'CUSTOMER', sourceVersion: sourceVNum, targetVersion: targetVNum } = input;

    const sourceVersion = await this.sduiRegistryRepository.getSpecificVersion(screenId, targetApp, sourceVNum);
    if (!sourceVersion) throw new NotFoundError(`Source version ${sourceVNum} not found for screen '${screenId}'`);

    const targetVersion = await this.sduiRegistryRepository.getSpecificVersion(screenId, targetApp, targetVNum);
    if (!targetVersion) throw new NotFoundError(`Target version ${targetVNum} not found for screen '${screenId}'`);

    const srcLayout = sourceVersion.layoutJson || {};
    const tgtLayout = targetVersion.layoutJson || {};
    const srcCounts = countHierarchy(srcLayout);
    const tgtCounts = countHierarchy(tgtLayout);

    return {
      screenId,
      targetApp,
      sourceVersion,
      targetVersion,
      comparisonSummary: {
        isIdentical: JSON.stringify(srcLayout) === JSON.stringify(tgtLayout),
        templateTypeChanged: (srcLayout as any).templateType !== (tgtLayout as any).templateType,
        componentsCountDelta: tgtCounts.components - srcCounts.components,
        sectionsCountDelta: tgtCounts.sections - srcCounts.sections,
        groupsCountDelta: tgtCounts.groups - srcCounts.groups,
        elementsCountDelta: tgtCounts.elements - srcCounts.elements,
      },
    };
  }
}
