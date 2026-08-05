import { NotFoundError } from '@carbroz/common';
export class CompareSduiVersionsUseCase {
    sduiRegistryRepository;
    constructor(sduiRegistryRepository) {
        this.sduiRegistryRepository = sduiRegistryRepository;
    }
    async execute(input) {
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
//# sourceMappingURL=CompareSduiVersionsUseCase.js.map