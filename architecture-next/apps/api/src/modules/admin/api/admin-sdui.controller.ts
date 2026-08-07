import { FastifyReply, FastifyRequest } from 'fastify';
import { ResponseHelper } from '@carbroz/common';
import { CreateSduiComponentUseCase } from '../../sdui/use-cases/CreateSduiComponentUseCase.js';
import { CreateSduiSubcomponentUseCase } from '../../sdui/use-cases/CreateSduiSubcomponentUseCase.js';
import { CreateSduiChildUseCase } from '../../sdui/use-cases/CreateSduiChildUseCase.js';
import { CreateSduiChildrenDataUseCase } from '../../sdui/use-cases/CreateSduiChildrenDataUseCase.js';
import { UpdateSduiScreenLayoutUseCase } from '../../sdui/use-cases/UpdateSduiScreenLayoutUseCase.js';
import { CreateSduiDraftUseCase } from '../../sdui/use-cases/CreateSduiDraftUseCase.js';
import { UpdateSduiDraftUseCase } from '../../sdui/use-cases/UpdateSduiDraftUseCase.js';
import { PublishSduiVersionUseCase } from '../../sdui/use-cases/PublishSduiVersionUseCase.js';
import { ArchiveSduiVersionUseCase } from '../../sdui/use-cases/ArchiveSduiVersionUseCase.js';
import { RollbackSduiVersionUseCase } from '../../sdui/use-cases/RollbackSduiVersionUseCase.js';
import { GetSduiVersionHistoryUseCase } from '../../sdui/use-cases/GetSduiVersionHistoryUseCase.js';
import { GetSduiSpecificVersionUseCase } from '../../sdui/use-cases/GetSduiSpecificVersionUseCase.js';
import { CompareSduiVersionsUseCase } from '../../sdui/use-cases/CompareSduiVersionsUseCase.js';
import {
  createSduiComponentSchema,
  createSduiSubcomponentSchema,
  createSduiChildSchema,
  createSduiChildrenDataSchema,
  updateSduiScreenSchema,
  createSduiDraftSchema,
  updateSduiDraftSchema,
  publishSduiVersionSchema,
  archiveSduiVersionSchema,
  rollbackSduiVersionSchema,
  compareSduiVersionsSchema
} from '../../sdui/dtos/sdui-registry.dto.js';

export class AdminSduiController {
  constructor(
    private readonly createSduiComponentUseCase: CreateSduiComponentUseCase,
    private readonly updateSduiScreenLayoutUseCase: UpdateSduiScreenLayoutUseCase,
    private readonly createSduiDraftUseCase?: CreateSduiDraftUseCase,
    private readonly updateSduiDraftUseCase?: UpdateSduiDraftUseCase,
    private readonly publishSduiVersionUseCase?: PublishSduiVersionUseCase,
    private readonly archiveSduiVersionUseCase?: ArchiveSduiVersionUseCase,
    private readonly rollbackSduiVersionUseCase?: RollbackSduiVersionUseCase,
    private readonly getSduiVersionHistoryUseCase?: GetSduiVersionHistoryUseCase,
    private readonly getSduiSpecificVersionUseCase?: GetSduiSpecificVersionUseCase,
    private readonly compareSduiVersionsUseCase?: CompareSduiVersionsUseCase,
    private readonly createSduiSubcomponentUseCase?: CreateSduiSubcomponentUseCase,
    private readonly createSduiChildUseCase?: CreateSduiChildUseCase,
    private readonly createSduiChildrenDataUseCase?: CreateSduiChildrenDataUseCase
  ) {}

  public registerComponent = async (request: FastifyRequest, reply: FastifyReply) => {
    const dto = createSduiComponentSchema.parse(request.body);
    const result = await this.createSduiComponentUseCase.execute({
      context: (request as any).requestContext,
      data: dto
    });
    return reply.status(201).send(ResponseHelper.success(result, 'Component created successfully'));
  };

  public registerSubcomponent = async (request: FastifyRequest, reply: FastifyReply) => {
    const dto = createSduiSubcomponentSchema.parse(request.body);
    const result = await this.createSduiSubcomponentUseCase!.execute({
      context: (request as any).requestContext,
      data: dto
    });
    return reply.status(201).send(ResponseHelper.success(result, 'Subcomponent created successfully'));
  };

  public registerChild = async (request: FastifyRequest, reply: FastifyReply) => {
    const dto = createSduiChildSchema.parse(request.body);
    const result = await this.createSduiChildUseCase!.execute({
      context: (request as any).requestContext,
      data: dto
    });
    return reply.status(201).send(ResponseHelper.success(result, 'Child created successfully'));
  };

  public registerChildrenData = async (request: FastifyRequest, reply: FastifyReply) => {
    const dto = createSduiChildrenDataSchema.parse(request.body);
    const result = await this.createSduiChildrenDataUseCase!.execute({
      context: (request as any).requestContext,
      data: dto
    });
    return reply.status(201).send(ResponseHelper.success(result, 'ChildrenData created successfully'));
  };

  public updateScreenLayout = async (request: FastifyRequest, reply: FastifyReply) => {
    const dto = updateSduiScreenSchema.parse(request.body);
    const result = await this.updateSduiScreenLayoutUseCase.execute({
      context: (request as any).requestContext,
      data: dto
    });
    return reply.send(ResponseHelper.success(result, 'Screen layout published successfully'));
  };

  public createDraft = async (request: FastifyRequest, reply: FastifyReply) => {
    const dto = createSduiDraftSchema.parse(request.body);
    const result = await this.createSduiDraftUseCase!.execute({
      context: (request as any).requestContext,
      data: dto
    });
    return reply.status(201).send(ResponseHelper.success(result, 'SDUI draft created successfully'));
  };

  public updateDraft = async (request: FastifyRequest, reply: FastifyReply) => {
    const dto = updateSduiDraftSchema.parse(request.body);
    const result = await this.updateSduiDraftUseCase!.execute({
      context: (request as any).requestContext,
      data: dto
    });
    return reply.send(ResponseHelper.success(result, 'SDUI draft updated successfully'));
  };

  public publishVersion = async (request: FastifyRequest, reply: FastifyReply) => {
    const dto = publishSduiVersionSchema.parse(request.body);
    const result = await this.publishSduiVersionUseCase!.execute({
      context: (request as any).requestContext,
      data: dto
    });
    return reply.send(ResponseHelper.success(result, 'SDUI screen version published successfully'));
  };

  public archiveVersion = async (request: FastifyRequest, reply: FastifyReply) => {
    const dto = archiveSduiVersionSchema.parse(request.body);
    const result = await this.archiveSduiVersionUseCase!.execute({
      context: (request as any).requestContext,
      data: dto
    });
    return reply.send(ResponseHelper.success(result, 'SDUI screen version archived successfully'));
  };

  public rollbackVersion = async (request: FastifyRequest, reply: FastifyReply) => {
    const dto = rollbackSduiVersionSchema.parse(request.body);
    const result = await this.rollbackSduiVersionUseCase!.execute({
      context: (request as any).requestContext,
      data: dto
    });
    return reply.status(201).send(ResponseHelper.success(result, 'SDUI screen version rolled back successfully'));
  };

  public getVersionHistory = async (request: FastifyRequest, reply: FastifyReply) => {
    const { screenId } = request.params as { screenId: string };
    const { targetApp } = request.query as { targetApp?: string };
    const result = await this.getSduiVersionHistoryUseCase!.execute({ screenId, targetApp });
    return reply.send(ResponseHelper.success(result, 'SDUI screen version history retrieved successfully'));
  };

  public getSpecificVersion = async (request: FastifyRequest, reply: FastifyReply) => {
    const { screenId, versionNumber } = request.params as { screenId: string; versionNumber: string };
    const { targetApp } = request.query as { targetApp?: string };
    const result = await this.getSduiSpecificVersionUseCase!.execute({
      screenId,
      targetApp,
      versionNumber: parseInt(versionNumber, 10)
    });
    return reply.send(ResponseHelper.success(result, 'SDUI specific version retrieved successfully'));
  };

  public compareVersions = async (request: FastifyRequest, reply: FastifyReply) => {
    const { screenId } = request.params as { screenId: string };
    const { targetApp, sourceVersion, targetVersion } = request.query as {
      targetApp?: string;
      sourceVersion: string;
      targetVersion: string;
    };
    const dto = compareSduiVersionsSchema.parse({
      screenId,
      targetApp,
      sourceVersion: parseInt(sourceVersion, 10),
      targetVersion: parseInt(targetVersion, 10)
    });
    const result = await this.compareSduiVersionsUseCase!.execute(dto);
    return reply.send(ResponseHelper.success(result, 'SDUI screen versions compared successfully'));
  };
}
