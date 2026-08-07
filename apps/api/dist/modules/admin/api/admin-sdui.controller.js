import { ResponseHelper } from '@carbroz/foundation-kernel';
import { createSduiComponentSchema, createSduiSubcomponentSchema, createSduiChildSchema, createSduiChildrenDataSchema, updateSduiScreenSchema, createSduiDraftSchema, updateSduiDraftSchema, publishSduiVersionSchema, archiveSduiVersionSchema, rollbackSduiVersionSchema, compareSduiVersionsSchema } from '../../sdui/dtos/sdui-registry.dto.js';
export class AdminSduiController {
    createSduiComponentUseCase;
    updateSduiScreenLayoutUseCase;
    createSduiDraftUseCase;
    updateSduiDraftUseCase;
    publishSduiVersionUseCase;
    archiveSduiVersionUseCase;
    rollbackSduiVersionUseCase;
    getSduiVersionHistoryUseCase;
    getSduiSpecificVersionUseCase;
    compareSduiVersionsUseCase;
    createSduiSubcomponentUseCase;
    createSduiChildUseCase;
    createSduiChildrenDataUseCase;
    constructor(createSduiComponentUseCase, updateSduiScreenLayoutUseCase, createSduiDraftUseCase, updateSduiDraftUseCase, publishSduiVersionUseCase, archiveSduiVersionUseCase, rollbackSduiVersionUseCase, getSduiVersionHistoryUseCase, getSduiSpecificVersionUseCase, compareSduiVersionsUseCase, createSduiSubcomponentUseCase, createSduiChildUseCase, createSduiChildrenDataUseCase) {
        this.createSduiComponentUseCase = createSduiComponentUseCase;
        this.updateSduiScreenLayoutUseCase = updateSduiScreenLayoutUseCase;
        this.createSduiDraftUseCase = createSduiDraftUseCase;
        this.updateSduiDraftUseCase = updateSduiDraftUseCase;
        this.publishSduiVersionUseCase = publishSduiVersionUseCase;
        this.archiveSduiVersionUseCase = archiveSduiVersionUseCase;
        this.rollbackSduiVersionUseCase = rollbackSduiVersionUseCase;
        this.getSduiVersionHistoryUseCase = getSduiVersionHistoryUseCase;
        this.getSduiSpecificVersionUseCase = getSduiSpecificVersionUseCase;
        this.compareSduiVersionsUseCase = compareSduiVersionsUseCase;
        this.createSduiSubcomponentUseCase = createSduiSubcomponentUseCase;
        this.createSduiChildUseCase = createSduiChildUseCase;
        this.createSduiChildrenDataUseCase = createSduiChildrenDataUseCase;
    }
    registerComponent = async (request, reply) => {
        const dto = createSduiComponentSchema.parse(request.body);
        const result = await this.createSduiComponentUseCase.execute({
            context: request.requestContext,
            data: dto
        });
        return reply.status(201).send(ResponseHelper.success(result, 'Component created successfully'));
    };
    registerSubcomponent = async (request, reply) => {
        const dto = createSduiSubcomponentSchema.parse(request.body);
        const result = await this.createSduiSubcomponentUseCase.execute({
            context: request.requestContext,
            data: dto
        });
        return reply.status(201).send(ResponseHelper.success(result, 'Subcomponent created successfully'));
    };
    registerChild = async (request, reply) => {
        const dto = createSduiChildSchema.parse(request.body);
        const result = await this.createSduiChildUseCase.execute({
            context: request.requestContext,
            data: dto
        });
        return reply.status(201).send(ResponseHelper.success(result, 'Child created successfully'));
    };
    registerChildrenData = async (request, reply) => {
        const dto = createSduiChildrenDataSchema.parse(request.body);
        const result = await this.createSduiChildrenDataUseCase.execute({
            context: request.requestContext,
            data: dto
        });
        return reply.status(201).send(ResponseHelper.success(result, 'ChildrenData created successfully'));
    };
    updateScreenLayout = async (request, reply) => {
        const dto = updateSduiScreenSchema.parse(request.body);
        const result = await this.updateSduiScreenLayoutUseCase.execute({
            context: request.requestContext,
            data: dto
        });
        return reply.send(ResponseHelper.success(result, 'Screen layout published successfully'));
    };
    createDraft = async (request, reply) => {
        const dto = createSduiDraftSchema.parse(request.body);
        const result = await this.createSduiDraftUseCase.execute({
            context: request.requestContext,
            data: dto
        });
        return reply.status(201).send(ResponseHelper.success(result, 'SDUI draft created successfully'));
    };
    updateDraft = async (request, reply) => {
        const dto = updateSduiDraftSchema.parse(request.body);
        const result = await this.updateSduiDraftUseCase.execute({
            context: request.requestContext,
            data: dto
        });
        return reply.send(ResponseHelper.success(result, 'SDUI draft updated successfully'));
    };
    publishVersion = async (request, reply) => {
        const dto = publishSduiVersionSchema.parse(request.body);
        const result = await this.publishSduiVersionUseCase.execute({
            context: request.requestContext,
            data: dto
        });
        return reply.send(ResponseHelper.success(result, 'SDUI screen version published successfully'));
    };
    archiveVersion = async (request, reply) => {
        const dto = archiveSduiVersionSchema.parse(request.body);
        const result = await this.archiveSduiVersionUseCase.execute({
            context: request.requestContext,
            data: dto
        });
        return reply.send(ResponseHelper.success(result, 'SDUI screen version archived successfully'));
    };
    rollbackVersion = async (request, reply) => {
        const dto = rollbackSduiVersionSchema.parse(request.body);
        const result = await this.rollbackSduiVersionUseCase.execute({
            context: request.requestContext,
            data: dto
        });
        return reply.status(201).send(ResponseHelper.success(result, 'SDUI screen version rolled back successfully'));
    };
    getVersionHistory = async (request, reply) => {
        const { screenId } = request.params;
        const { targetApp } = request.query;
        const result = await this.getSduiVersionHistoryUseCase.execute({ screenId, targetApp });
        return reply.send(ResponseHelper.success(result, 'SDUI screen version history retrieved successfully'));
    };
    getSpecificVersion = async (request, reply) => {
        const { screenId, versionNumber } = request.params;
        const { targetApp } = request.query;
        const result = await this.getSduiSpecificVersionUseCase.execute({
            screenId,
            targetApp,
            versionNumber: parseInt(versionNumber, 10)
        });
        return reply.send(ResponseHelper.success(result, 'SDUI specific version retrieved successfully'));
    };
    compareVersions = async (request, reply) => {
        const { screenId } = request.params;
        const { targetApp, sourceVersion, targetVersion } = request.query;
        const dto = compareSduiVersionsSchema.parse({
            screenId,
            targetApp,
            sourceVersion: parseInt(sourceVersion, 10),
            targetVersion: parseInt(targetVersion, 10)
        });
        const result = await this.compareSduiVersionsUseCase.execute(dto);
        return reply.send(ResponseHelper.success(result, 'SDUI screen versions compared successfully'));
    };
}
//# sourceMappingURL=admin-sdui.controller.js.map