import { FastifyReply, FastifyRequest } from 'fastify';
import { ResponseHelper } from '@carbroz/common';
import {
  ArchiveSduiVersionUseCase,
  CompareSduiVersionsUseCase,
  CreateSduiComponentUseCase,
  CreateSduiDraftUseCase,
  CreateSduiElementUseCase,
  CreateSduiGroupUseCase,
  CreateSduiSectionUseCase,
  GetSduiSpecificVersionUseCase,
  GetSduiVersionHistoryUseCase,
  PublishSduiVersionUseCase,
  RollbackSduiVersionUseCase,
  UpdateSduiDraftUseCase,
} from '@carbroz/sdui-registry';
import { toExecutionContext } from '../../../context/toExecutionContext.js';
import {
  archiveSduiVersionSchema,
  compareSduiVersionsSchema,
  createSduiComponentSchema,
  createSduiDraftSchema,
  createSduiElementSchema,
  createSduiGroupSchema,
  createSduiSectionSchema,
  publishSduiVersionSchema,
  rollbackSduiVersionSchema,
  updateSduiDraftSchema,
} from '../../sdui/dtos/sdui-registry.dto.js';

const targetApps = ['GLOBAL', 'CUSTOMER', 'PARTNER'] as const;
type TargetApp = (typeof targetApps)[number];

/** Parses the optional runtime SDUI publication scope accepted by Admin queries. */
function parseTargetApp(value: unknown): TargetApp | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || !targetApps.includes(value as TargetApp)) {
    throw new Error(`Invalid targetApp '${String(value)}'`);
  }
  return value as TargetApp;
}

/**
 * Admin HTTP adapter for SDUI management operations.
 *
 * Business/application behavior is owned by `@carbroz/sdui-registry`;
 * this controller only validates transport input, adapts execution context,
 * delegates, and formats HTTP responses.
 */
export class AdminSduiController {
  constructor(
    private readonly createSduiComponentUseCase: CreateSduiComponentUseCase,
    private readonly createSduiDraftUseCase: CreateSduiDraftUseCase,
    private readonly updateSduiDraftUseCase: UpdateSduiDraftUseCase,
    private readonly publishSduiVersionUseCase: PublishSduiVersionUseCase,
    private readonly archiveSduiVersionUseCase: ArchiveSduiVersionUseCase,
    private readonly rollbackSduiVersionUseCase: RollbackSduiVersionUseCase,
    private readonly getSduiVersionHistoryUseCase: GetSduiVersionHistoryUseCase,
    private readonly getSduiSpecificVersionUseCase: GetSduiSpecificVersionUseCase,
    private readonly compareSduiVersionsUseCase: CompareSduiVersionsUseCase,
    private readonly createSduiSectionUseCase: CreateSduiSectionUseCase,
    private readonly createSduiGroupUseCase: CreateSduiGroupUseCase,
    private readonly createSduiElementUseCase: CreateSduiElementUseCase,
  ) {}

  public registerComponent = async (request: FastifyRequest, reply: FastifyReply) => {
    const dto = createSduiComponentSchema.parse(request.body);
    const result = await this.createSduiComponentUseCase.execute({
      context: toExecutionContext(request),
      data: dto,
    });
    return reply.status(201).send(ResponseHelper.success(result, 'Component created successfully'));
  };

  public registerSection = async (request: FastifyRequest, reply: FastifyReply) => {
    const dto = createSduiSectionSchema.parse(request.body);
    const result = await this.createSduiSectionUseCase.execute({
      context: toExecutionContext(request),
      data: dto,
    });
    return reply.status(201).send(ResponseHelper.success(result, 'Section created successfully'));
  };

  public registerGroup = async (request: FastifyRequest, reply: FastifyReply) => {
    const dto = createSduiGroupSchema.parse(request.body);
    const result = await this.createSduiGroupUseCase.execute({
      context: toExecutionContext(request),
      data: dto,
    });
    return reply.status(201).send(ResponseHelper.success(result, 'Group created successfully'));
  };

  public registerElement = async (request: FastifyRequest, reply: FastifyReply) => {
    const dto = createSduiElementSchema.parse(request.body);
    const result = await this.createSduiElementUseCase.execute({
      context: toExecutionContext(request),
      data: dto,
    });
    return reply.status(201).send(ResponseHelper.success(result, 'Element created successfully'));
  };

  public createDraft = async (request: FastifyRequest, reply: FastifyReply) => {
    const dto = createSduiDraftSchema.parse(request.body);
    const result = await this.createSduiDraftUseCase.execute({
      context: toExecutionContext(request),
      data: dto,
    });
    return reply.status(201).send(ResponseHelper.success(result, 'SDUI draft created successfully'));
  };

  public updateDraft = async (request: FastifyRequest, reply: FastifyReply) => {
    const dto = updateSduiDraftSchema.parse(request.body);
    const result = await this.updateSduiDraftUseCase.execute({
      context: toExecutionContext(request),
      data: dto,
    });
    return reply.send(ResponseHelper.success(result, 'SDUI draft updated successfully'));
  };

  public publishVersion = async (request: FastifyRequest, reply: FastifyReply) => {
    const dto = publishSduiVersionSchema.parse(request.body);
    const result = await this.publishSduiVersionUseCase.execute({
      context: toExecutionContext(request),
      data: dto,
    });
    return reply.send(ResponseHelper.success(result, 'SDUI screen version published successfully'));
  };

  public archiveVersion = async (request: FastifyRequest, reply: FastifyReply) => {
    const dto = archiveSduiVersionSchema.parse(request.body);
    const result = await this.archiveSduiVersionUseCase.execute({
      context: toExecutionContext(request),
      data: dto,
    });
    return reply.send(ResponseHelper.success(result, 'SDUI screen version archived successfully'));
  };

  public rollbackVersion = async (request: FastifyRequest, reply: FastifyReply) => {
    const dto = rollbackSduiVersionSchema.parse(request.body);
    const result = await this.rollbackSduiVersionUseCase.execute({
      context: toExecutionContext(request),
      data: dto,
    });
    return reply.status(201).send(ResponseHelper.success(result, 'SDUI screen version rolled back successfully'));
  };

  public getVersionHistory = async (request: FastifyRequest, reply: FastifyReply) => {
    const { screenId } = request.params as { screenId: string };
    const { targetApp } = request.query as { targetApp?: unknown };
    const result = await this.getSduiVersionHistoryUseCase.execute({
      screenId,
      targetApp: parseTargetApp(targetApp),
    });
    return reply.send(ResponseHelper.success(result, 'SDUI screen version history retrieved successfully'));
  };

  public getSpecificVersion = async (request: FastifyRequest, reply: FastifyReply) => {
    const { screenId, versionNumber } = request.params as { screenId: string; versionNumber: string };
    const { targetApp } = request.query as { targetApp?: unknown };
    const result = await this.getSduiSpecificVersionUseCase.execute({
      screenId,
      targetApp: parseTargetApp(targetApp),
      versionNumber: parseInt(versionNumber, 10),
    });
    return reply.send(ResponseHelper.success(result, 'SDUI specific version retrieved successfully'));
  };

  public compareVersions = async (request: FastifyRequest, reply: FastifyReply) => {
    const { screenId } = request.params as { screenId: string };
    const { targetApp, sourceVersion, targetVersion } = request.query as {
      targetApp?: unknown;
      sourceVersion: string;
      targetVersion: string;
    };
    const dto = compareSduiVersionsSchema.parse({
      screenId,
      targetApp: parseTargetApp(targetApp),
      sourceVersion: parseInt(sourceVersion, 10),
      targetVersion: parseInt(targetVersion, 10),
    });
    const result = await this.compareSduiVersionsUseCase.execute(dto);
    return reply.send(ResponseHelper.success(result, 'SDUI screen versions compared successfully'));
  };
}
