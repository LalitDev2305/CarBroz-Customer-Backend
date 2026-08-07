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
    subcomponentsCountDelta: number;
  };
}

export class CompareSduiVersionsUseCase implements IUseCase<CompareSduiVersionsDto, CompareSduiVersionsResult> {
  constructor(private readonly sduiRegistryRepository: ISduiRegistryRepository) {}

  public async execute(input: CompareSduiVersionsDto): Promise<CompareSduiVersionsResult> {
    const { screenId, targetApp = 'CUSTOMER', sourceVersion: sourceVNum, targetVersion: targetVNum } = input;

    const sourceVersion = await this.sduiRegistryRepository.getSpecificVersion(screenId, targetApp, sourceVNum);
    if (!sourceVersion) {
      throw new NotFoundError(`Source version ${sourceVNum} not found for screen '${screenId}'`);
    }

    const targetVersion = await this.sduiRegistryRepository.getSpecificVersion(screenId, targetApp, targetVNum);
    if (!targetVersion) {
      throw new NotFoundError(`Target version ${targetVNum} not found for screen '${screenId}'`);
    }

    const srcLayout = sourceVersion.layoutJson || {};
    const tgtLayout = targetVersion.layoutJson || {};

    const srcComps = Array.isArray(srcLayout.components) ? srcLayout.components : [];
    const tgtComps = Array.isArray(tgtLayout.components) ? tgtLayout.components : [];

    const srcSubComps = Array.isArray(srcLayout.subcomponents) ? srcLayout.subcomponents : [];
    const tgtSubComps = Array.isArray(tgtLayout.subcomponents) ? tgtLayout.subcomponents : [];

    const isIdentical = JSON.stringify(srcLayout) === JSON.stringify(tgtLayout);
    const templateTypeChanged = srcLayout.templateType !== tgtLayout.templateType;
    const componentsCountDelta = tgtComps.length - srcComps.length;
    const subcomponentsCountDelta = tgtSubComps.length - srcSubComps.length;

    return {
      screenId,
      targetApp,
      sourceVersion,
      targetVersion,
      comparisonSummary: {
        isIdentical,
        templateTypeChanged,
        componentsCountDelta,
        subcomponentsCountDelta
      }
    };
  }
}
