import { BadRequestError, ConflictError, NotFoundError } from '@carbroz/common';
import {
  parseSduiScreen,
  targetAppSchema,
  templateSchema,
  type SduiScreen,
  type SduiTargetApp,
  type SduiTemplate,
} from '@carbroz/sdui-engine';
import { SduiComponentEntity } from '../../domain/SduiComponent.js';
import { SduiElementEntity } from '../../domain/SduiElement.js';
import { SduiGroupEntity } from '../../domain/SduiGroup.js';
import { SduiScreenEntity, type SduiScreenStatus } from '../../domain/SduiScreen.js';
import { SduiSectionEntity } from '../../domain/SduiSection.js';
import { SduiTemplateEntity } from '../../domain/SduiTemplate.js';
import type {
  CreateDraftInput,
  ISduiRegistryRepository,
  RegistryNodeInput,
  UpdateDraftInput,
} from '../../domain/repositories/ISduiRegistryRepository.js';
import type { SduiNodeLevel } from '../../domain/SduiNodeLevel.js';
import type {
  RegistryPersistenceRecord,
  ScreenPersistenceRecord,
  SduiPersistenceClient,
  TemplatePersistenceRecord,
} from '../persistence/SduiPersistenceClient.js';

function parseScreenStatus(status: string): SduiScreenStatus {
  if (status === 'DRAFT' || status === 'PUBLISHED' || status === 'ARCHIVED') return status;
  throw new Error(`Unsupported SDUI screen status '${status}'`);
}

export class PrismaSduiRegistryRepository implements ISduiRegistryRepository {
  constructor(private readonly prismaClient: SduiPersistenceClient) {}

  private mapScreen(record: ScreenPersistenceRecord): SduiScreenEntity {
    return new SduiScreenEntity({
      id: record.id,
      publicId: record.publicId,
      screenId: record.screenId,
      targetApp: targetAppSchema.parse(record.targetApp),
      versionNumber: record.versionNumber,
      status: parseScreenStatus(record.status),
      layoutJson: parseSduiScreen(record.layoutJson),
      lockVersion: record.lockVersion,
      publishedAt: record.publishedAt,
      publishedBy: record.publishedBy,
      createdFromVersion: record.createdFromVersion,
      changeDescription: record.changeDescription,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  private mapTemplate(record: TemplatePersistenceRecord): SduiTemplateEntity {
    return new SduiTemplateEntity({
      id: record.id,
      publicId: record.publicId,
      templateId: record.templateId,
      templateType: record.templateType,
      defaultLayoutJson: templateSchema.parse(record.defaultLayoutJson),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  public async findPublishedScreen(
    screenId: string,
    targetApp: SduiTargetApp = 'CUSTOMER',
  ): Promise<SduiScreenEntity | null> {
    const record = await this.prismaClient.sduiScreen.findFirst({
      where: { screenId, targetApp, status: 'PUBLISHED' },
      orderBy: { versionNumber: 'desc' },
    });
    return record ? this.mapScreen(record) : null;
  }

  public async upsertScreen(
    screenId: string,
    targetApp: SduiTargetApp,
    layoutJson: SduiScreen,
    isPublished = true,
  ): Promise<SduiScreenEntity> {
    const document = parseSduiScreen(layoutJson);
    if (isPublished) return this.createDraftAndPublish(screenId, targetApp, document);

    const draft = await this.findDraft(screenId, targetApp);
    if (draft) {
      return this.updateDraft({
        screenId,
        targetApp,
        layoutJson: document,
        lockVersion: draft.lockVersion,
      });
    }
    return this.createDraft({ screenId, targetApp, layoutJson: document });
  }

  private async createDraftAndPublish(
    screenId: string,
    targetApp: SduiTargetApp,
    layoutJson: SduiScreen,
  ): Promise<SduiScreenEntity> {
    return this.prismaClient.$transaction(async (tx) => {
      const latest = await tx.sduiScreen.findFirst({
        where: { screenId, targetApp },
        orderBy: { versionNumber: 'desc' },
      });
      const versionNumber = latest ? latest.versionNumber + 1 : 1;

      await tx.sduiScreen.updateMany({
        where: { screenId, targetApp, status: 'PUBLISHED' },
        data: { status: 'ARCHIVED' },
      });

      const created = await tx.sduiScreen.create({
        data: {
          screenId,
          targetApp,
          versionNumber,
          status: 'PUBLISHED',
          layoutJson,
          lockVersion: 1,
          publishedAt: new Date(),
          publishedBy: 'system',
          createdFromVersion: latest?.versionNumber ?? null,
          changeDescription: 'Published via upsert',
        },
      });
      return this.mapScreen(created);
    });
  }

  public async createDraft(input: CreateDraftInput): Promise<SduiScreenEntity> {
    const targetApp = input.targetApp ?? 'CUSTOMER';
    const layoutJson = parseSduiScreen(input.layoutJson);

    return this.prismaClient.$transaction(async (tx) => {
      const existingDraft = await tx.sduiScreen.findFirst({
        where: { screenId: input.screenId, targetApp, status: 'DRAFT' },
      });

      if (existingDraft) {
        if (!input.overwriteExistingDraft) {
          throw new ConflictError(`Active draft already exists for screen '${input.screenId}'`);
        }
        const updated = await tx.sduiScreen.update({
          where: { id: existingDraft.id },
          data: {
            layoutJson,
            lockVersion: existingDraft.lockVersion + 1,
            changeDescription: input.changeDescription ?? existingDraft.changeDescription,
          },
        });
        return this.mapScreen(updated);
      }

      const latest = await tx.sduiScreen.findFirst({
        where: { screenId: input.screenId, targetApp },
        orderBy: { versionNumber: 'desc' },
      });

      const draft = await tx.sduiScreen.create({
        data: {
          screenId: input.screenId,
          targetApp,
          versionNumber: latest ? latest.versionNumber + 1 : 1,
          status: 'DRAFT',
          layoutJson,
          lockVersion: 1,
          createdFromVersion: input.createdFromVersion ?? latest?.versionNumber ?? null,
          changeDescription: input.changeDescription ?? 'Created draft',
        },
      });
      return this.mapScreen(draft);
    });
  }

  public async updateDraft(input: UpdateDraftInput): Promise<SduiScreenEntity> {
    const targetApp = input.targetApp ?? 'CUSTOMER';
    const layoutJson = parseSduiScreen(input.layoutJson);
    const draft = await this.prismaClient.sduiScreen.findFirst({
      where: { screenId: input.screenId, targetApp, status: 'DRAFT' },
    });

    if (!draft) throw new NotFoundError(`No active draft found for screen '${input.screenId}'`);
    if (draft.lockVersion !== input.lockVersion) {
      throw new ConflictError(`Lock version mismatch: expected ${input.lockVersion}, current is ${draft.lockVersion}`);
    }

    const updated = await this.prismaClient.sduiScreen.update({
      where: { id: draft.id },
      data: {
        layoutJson,
        lockVersion: draft.lockVersion + 1,
        changeDescription: input.changeDescription ?? draft.changeDescription,
      },
    });
    return this.mapScreen(updated);
  }

  public async publishVersion(
    screenId: string,
    targetApp: SduiTargetApp,
    versionNumber: number,
    publishedBy: string,
  ): Promise<SduiScreenEntity> {
    return this.prismaClient.$transaction(async (tx) => {
      const targetVersion = await tx.sduiScreen.findFirst({ where: { screenId, targetApp, versionNumber } });
      if (!targetVersion) {
        throw new NotFoundError(`Screen version ${versionNumber} not found for screen '${screenId}'`);
      }
      if (targetVersion.status === 'PUBLISHED') return this.mapScreen(targetVersion);

      await tx.sduiScreen.updateMany({
        where: { screenId, targetApp, status: 'PUBLISHED' },
        data: { status: 'ARCHIVED' },
      });

      const published = await tx.sduiScreen.update({
        where: { id: targetVersion.id },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
          publishedBy,
          lockVersion: targetVersion.lockVersion + 1,
        },
      });
      return this.mapScreen(published);
    });
  }

  public async archiveVersion(
    screenId: string,
    targetApp: SduiTargetApp,
    versionNumber: number,
  ): Promise<SduiScreenEntity> {
    const targetVersion = await this.prismaClient.sduiScreen.findFirst({ where: { screenId, targetApp, versionNumber } });
    if (!targetVersion) {
      throw new NotFoundError(`Screen version ${versionNumber} not found for screen '${screenId}'`);
    }
    if (targetVersion.status === 'PUBLISHED') {
      throw new BadRequestError('Cannot archive the currently PUBLISHED version. Publish another version first.');
    }

    const archived = await this.prismaClient.sduiScreen.update({
      where: { id: targetVersion.id },
      data: { status: 'ARCHIVED', lockVersion: targetVersion.lockVersion + 1 },
    });
    return this.mapScreen(archived);
  }

  public async rollbackVersion(
    screenId: string,
    targetApp: SduiTargetApp,
    targetVersionNumber: number,
    publishedBy: string,
  ): Promise<SduiScreenEntity> {
    return this.prismaClient.$transaction(async (tx) => {
      const targetVersion = await tx.sduiScreen.findFirst({
        where: { screenId, targetApp, versionNumber: targetVersionNumber },
      });
      if (!targetVersion) {
        throw new NotFoundError(`Target rollback version ${targetVersionNumber} not found for screen '${screenId}'`);
      }

      const canonicalLayout = parseSduiScreen(targetVersion.layoutJson);
      const latest = await tx.sduiScreen.findFirst({
        where: { screenId, targetApp },
        orderBy: { versionNumber: 'desc' },
      });

      await tx.sduiScreen.updateMany({
        where: { screenId, targetApp, status: 'PUBLISHED' },
        data: { status: 'ARCHIVED' },
      });

      const created = await tx.sduiScreen.create({
        data: {
          screenId,
          targetApp,
          versionNumber: latest ? latest.versionNumber + 1 : 1,
          status: 'PUBLISHED',
          layoutJson: canonicalLayout,
          lockVersion: 1,
          publishedAt: new Date(),
          publishedBy,
          createdFromVersion: targetVersionNumber,
          changeDescription: `Rollback to version ${targetVersionNumber}`,
        },
      });
      return this.mapScreen(created);
    });
  }

  public async getVersionHistory(
    screenId: string,
    targetApp: SduiTargetApp = 'CUSTOMER',
  ): Promise<SduiScreenEntity[]> {
    const records = await this.prismaClient.sduiScreen.findMany({
      where: { screenId, targetApp },
      orderBy: { versionNumber: 'desc' },
    });
    return records.map((record) => this.mapScreen(record));
  }

  public async getSpecificVersion(
    screenId: string,
    targetApp: SduiTargetApp,
    versionNumber: number,
  ): Promise<SduiScreenEntity | null> {
    const record = await this.prismaClient.sduiScreen.findFirst({ where: { screenId, targetApp, versionNumber } });
    return record ? this.mapScreen(record) : null;
  }

  public async findDraft(
    screenId: string,
    targetApp: SduiTargetApp = 'CUSTOMER',
  ): Promise<SduiScreenEntity | null> {
    const record = await this.prismaClient.sduiScreen.findFirst({
      where: { screenId, targetApp, status: 'DRAFT' },
    });
    return record ? this.mapScreen(record) : null;
  }

  public async getTemplate(templateId: string): Promise<SduiTemplateEntity | null> {
    const record = await this.prismaClient.sduiTemplate.findUnique({ where: { templateId } });
    return record ? this.mapTemplate(record) : null;
  }

  public async upsertTemplate(
    templateId: string,
    templateType: string,
    defaultLayoutJson: SduiTemplate,
  ): Promise<SduiTemplateEntity> {
    const template = templateSchema.parse(defaultLayoutJson);
    const record = await this.prismaClient.sduiTemplate.upsert({
      where: { templateId },
      update: { templateType, defaultLayoutJson: template },
      create: { templateId, templateType, defaultLayoutJson: template },
    });
    return this.mapTemplate(record);
  }

  private async upsertNodeRecord(input: RegistryNodeInput, nodeLevel: SduiNodeLevel): Promise<RegistryPersistenceRecord> {
    return this.prismaClient.sduiComponentRegistry.upsert({
      where: { name: input.name },
      update: {
        nodeLevel,
        componentType: input.componentType,
        schemaJson: input.schemaJson,
        supportedProperties: input.supportedProperties,
        supportedActions: input.supportedActions,
      },
      create: {
        name: input.name,
        nodeLevel,
        componentType: input.componentType,
        schemaJson: input.schemaJson,
        supportedProperties: input.supportedProperties,
        supportedActions: input.supportedActions,
      },
    });
  }

  private async findNodeRecord(name: string, nodeLevel: SduiNodeLevel): Promise<RegistryPersistenceRecord | null> {
    return this.prismaClient.sduiComponentRegistry.findFirst({ where: { name, nodeLevel } });
  }

  private async listNodeRecords(nodeLevel: SduiNodeLevel): Promise<RegistryPersistenceRecord[]> {
    return this.prismaClient.sduiComponentRegistry.findMany({
      where: { nodeLevel },
      orderBy: { id: 'asc' },
    });
  }

  public async createComponent(input: RegistryNodeInput): Promise<SduiComponentEntity> {
    return new SduiComponentEntity(await this.upsertNodeRecord(input, 'COMPONENT'));
  }

  public async getComponent(name: string): Promise<SduiComponentEntity | null> {
    const record = await this.findNodeRecord(name, 'COMPONENT');
    return record ? new SduiComponentEntity(record) : null;
  }

  public async listComponents(): Promise<SduiComponentEntity[]> {
    return (await this.listNodeRecords('COMPONENT')).map((record) => new SduiComponentEntity(record));
  }

  public async createSection(input: RegistryNodeInput): Promise<SduiSectionEntity> {
    return new SduiSectionEntity(await this.upsertNodeRecord(input, 'SECTION'));
  }

  public async getSection(name: string): Promise<SduiSectionEntity | null> {
    const record = await this.findNodeRecord(name, 'SECTION');
    return record ? new SduiSectionEntity(record) : null;
  }

  public async listSections(): Promise<SduiSectionEntity[]> {
    return (await this.listNodeRecords('SECTION')).map((record) => new SduiSectionEntity(record));
  }

  public async createGroup(input: RegistryNodeInput): Promise<SduiGroupEntity> {
    return new SduiGroupEntity(await this.upsertNodeRecord(input, 'GROUP'));
  }

  public async getGroup(name: string): Promise<SduiGroupEntity | null> {
    const record = await this.findNodeRecord(name, 'GROUP');
    return record ? new SduiGroupEntity(record) : null;
  }

  public async listGroups(): Promise<SduiGroupEntity[]> {
    return (await this.listNodeRecords('GROUP')).map((record) => new SduiGroupEntity(record));
  }

  public async createElement(input: RegistryNodeInput): Promise<SduiElementEntity> {
    return new SduiElementEntity(await this.upsertNodeRecord(input, 'ELEMENT'));
  }

  public async getElement(name: string): Promise<SduiElementEntity | null> {
    const record = await this.findNodeRecord(name, 'ELEMENT');
    return record ? new SduiElementEntity(record) : null;
  }

  public async listElements(): Promise<SduiElementEntity[]> {
    return (await this.listNodeRecords('ELEMENT')).map((record) => new SduiElementEntity(record));
  }
}
