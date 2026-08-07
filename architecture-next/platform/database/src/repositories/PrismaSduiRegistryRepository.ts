import { 
  ISduiRegistryRepository, 
  SduiScreenEntity, 
  SduiTemplateEntity, 
  SduiComponentEntity,
  SduiSubcomponentEntity,
  SduiChildEntity,
  SduiChildrenDataEntity,
  CreateDraftInput,
  UpdateDraftInput,
  SduiScreenStatus,
  ConflictError,
  NotFoundError,
  BadRequestError
} from '@carbroz/common';
import { PrismaProvider } from '../providers/PrismaProvider.js';

export class PrismaSduiRegistryRepository implements ISduiRegistryRepository {
  constructor(private readonly prismaProvider: PrismaProvider) {}

  private get client(): any {
    return this.prismaProvider.getClient();
  }

  private mapToEntity(record: any): SduiScreenEntity {
    return new SduiScreenEntity({
      id: record.id,
      publicId: record.publicId,
      screenId: record.screenId,
      targetApp: record.targetApp,
      versionNumber: record.versionNumber ?? record.version ?? 1,
      status: (record.status as SduiScreenStatus) ?? (record.isPublished ? 'PUBLISHED' : 'DRAFT'),
      layoutJson: record.layoutJson,
      lockVersion: record.lockVersion ?? 1,
      publishedAt: record.publishedAt,
      publishedBy: record.publishedBy,
      createdFromVersion: record.createdFromVersion,
      changeDescription: record.changeDescription,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  public async findPublishedScreen(screenId: string, targetApp: string = 'CUSTOMER'): Promise<SduiScreenEntity | null> {
    const screen = await this.client.sduiScreen.findFirst({
      where: {
        screenId,
        targetApp,
        status: 'PUBLISHED',
      },
      orderBy: { versionNumber: 'desc' }
    });

    if (!screen) return null;
    return this.mapToEntity(screen);
  }

  public async upsertScreen(
    screenId: string,
    targetApp: string,
    layoutJson: any,
    isPublished: boolean = true
  ): Promise<SduiScreenEntity> {
    if (isPublished) {
      return await this.createDraftAndPublish(screenId, targetApp, layoutJson);
    } else {
      const draft = await this.findDraft(screenId, targetApp);
      if (draft) {
        return await this.updateDraft({
          screenId,
          targetApp,
          layoutJson,
          lockVersion: draft.lockVersion
        });
      } else {
        return await this.createDraft({
          screenId,
          targetApp,
          layoutJson
        });
      }
    }
  }

  private async createDraftAndPublish(screenId: string, targetApp: string, layoutJson: any): Promise<SduiScreenEntity> {
    return await this.client.$transaction(async (tx: any) => {
      const latest = await tx.sduiScreen.findFirst({
        where: { screenId, targetApp },
        orderBy: { versionNumber: 'desc' }
      });

      const newVersionNumber = latest ? latest.versionNumber + 1 : 1;

      await tx.sduiScreen.updateMany({
        where: { screenId, targetApp, status: 'PUBLISHED' },
        data: { status: 'ARCHIVED' }
      });

      const created = await tx.sduiScreen.create({
        data: {
          screenId,
          targetApp,
          versionNumber: newVersionNumber,
          status: 'PUBLISHED',
          layoutJson,
          lockVersion: 1,
          publishedAt: new Date(),
          publishedBy: 'system',
          createdFromVersion: latest ? latest.versionNumber : null,
          changeDescription: 'Published via upsert'
        }
      });

      return this.mapToEntity(created);
    });
  }

  public async createDraft(input: CreateDraftInput): Promise<SduiScreenEntity> {
    const targetApp = input.targetApp || 'CUSTOMER';

    return await this.client.$transaction(async (tx: any) => {
      const existingDraft = await tx.sduiScreen.findFirst({
        where: { screenId: input.screenId, targetApp, status: 'DRAFT' }
      });

      if (existingDraft) {
        if (input.overwriteExistingDraft) {
          const updated = await tx.sduiScreen.update({
            where: { id: existingDraft.id },
            data: {
              layoutJson: input.layoutJson,
              lockVersion: existingDraft.lockVersion + 1,
              changeDescription: input.changeDescription || existingDraft.changeDescription
            }
          });
          return this.mapToEntity(updated);
        }
        throw new ConflictError(`Active draft already exists for screen '${input.screenId}'`);
      }

      const latest = await tx.sduiScreen.findFirst({
        where: { screenId: input.screenId, targetApp },
        orderBy: { versionNumber: 'desc' }
      });

      const newVersionNumber = latest ? latest.versionNumber + 1 : 1;

      const draft = await tx.sduiScreen.create({
        data: {
          screenId: input.screenId,
          targetApp,
          versionNumber: newVersionNumber,
          status: 'DRAFT',
          layoutJson: input.layoutJson,
          lockVersion: 1,
          createdFromVersion: input.createdFromVersion || (latest ? latest.versionNumber : null),
          changeDescription: input.changeDescription || 'Created draft'
        }
      });

      return this.mapToEntity(draft);
    });
  }

  public async updateDraft(input: UpdateDraftInput): Promise<SduiScreenEntity> {
    const targetApp = input.targetApp || 'CUSTOMER';

    const draft = await this.client.sduiScreen.findFirst({
      where: { screenId: input.screenId, targetApp, status: 'DRAFT' }
    });

    if (!draft) {
      throw new NotFoundError(`No active draft found for screen '${input.screenId}'`);
    }

    if (draft.lockVersion !== input.lockVersion) {
      throw new ConflictError(`Lock version mismatch: expected ${input.lockVersion}, current is ${draft.lockVersion}`);
    }

    const updated = await this.client.sduiScreen.update({
      where: { id: draft.id },
      data: {
        layoutJson: input.layoutJson,
        lockVersion: draft.lockVersion + 1,
        changeDescription: input.changeDescription || draft.changeDescription
      }
    });

    return this.mapToEntity(updated);
  }

  public async publishVersion(
    screenId: string,
    targetApp: string = 'CUSTOMER',
    versionNumber: number,
    publishedBy: string = 'admin'
  ): Promise<SduiScreenEntity> {
    return await this.client.$transaction(async (tx: any) => {
      const targetVersion = await tx.sduiScreen.findFirst({
        where: { screenId, targetApp, versionNumber }
      });

      if (!targetVersion) {
        throw new NotFoundError(`Screen version ${versionNumber} not found for screen '${screenId}'`);
      }

      if (targetVersion.status === 'PUBLISHED') {
        return this.mapToEntity(targetVersion);
      }

      await tx.sduiScreen.updateMany({
        where: { screenId, targetApp, status: 'PUBLISHED' },
        data: { status: 'ARCHIVED' }
      });

      const published = await tx.sduiScreen.update({
        where: { id: targetVersion.id },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
          publishedBy,
          lockVersion: targetVersion.lockVersion + 1
        }
      });

      return this.mapToEntity(published);
    });
  }

  public async archiveVersion(
    screenId: string,
    targetApp: string = 'CUSTOMER',
    versionNumber: number
  ): Promise<SduiScreenEntity> {
    const targetVersion = await this.client.sduiScreen.findFirst({
      where: { screenId, targetApp, versionNumber }
    });

    if (!targetVersion) {
      throw new NotFoundError(`Screen version ${versionNumber} not found for screen '${screenId}'`);
    }

    if (targetVersion.status === 'PUBLISHED') {
      throw new BadRequestError(`Cannot archive the currently PUBLISHED version. Publish another version first.`);
    }

    const archived = await this.client.sduiScreen.update({
      where: { id: targetVersion.id },
      data: {
        status: 'ARCHIVED',
        lockVersion: targetVersion.lockVersion + 1
      }
    });

    return this.mapToEntity(archived);
  }

  public async rollbackVersion(
    screenId: string,
    targetApp: string = 'CUSTOMER',
    targetVersionNumber: number,
    publishedBy: string = 'admin'
  ): Promise<SduiScreenEntity> {
    return await this.client.$transaction(async (tx: any) => {
      const targetVersion = await tx.sduiScreen.findFirst({
        where: { screenId, targetApp, versionNumber: targetVersionNumber }
      });

      if (!targetVersion) {
        throw new NotFoundError(`Target rollback version ${targetVersionNumber} not found for screen '${screenId}'`);
      }

      const latest = await tx.sduiScreen.findFirst({
        where: { screenId, targetApp },
        orderBy: { versionNumber: 'desc' }
      });

      const newVersionNumber = latest ? latest.versionNumber + 1 : 1;

      await tx.sduiScreen.updateMany({
        where: { screenId, targetApp, status: 'PUBLISHED' },
        data: { status: 'ARCHIVED' }
      });

      const created = await tx.sduiScreen.create({
        data: {
          screenId,
          targetApp,
          versionNumber: newVersionNumber,
          status: 'PUBLISHED',
          layoutJson: targetVersion.layoutJson,
          lockVersion: 1,
          publishedAt: new Date(),
          publishedBy,
          createdFromVersion: targetVersionNumber,
          changeDescription: `Rollback to version ${targetVersionNumber}`
        }
      });

      return this.mapToEntity(created);
    });
  }

  public async getVersionHistory(screenId: string, targetApp: string = 'CUSTOMER'): Promise<SduiScreenEntity[]> {
    const records = await this.client.sduiScreen.findMany({
      where: { screenId, targetApp },
      orderBy: { versionNumber: 'desc' }
    });

    return records.map((r: any) => this.mapToEntity(r));
  }

  public async getSpecificVersion(
    screenId: string,
    targetApp: string = 'CUSTOMER',
    versionNumber: number
  ): Promise<SduiScreenEntity | null> {
    const record = await this.client.sduiScreen.findFirst({
      where: { screenId, targetApp, versionNumber }
    });

    if (!record) return null;
    return this.mapToEntity(record);
  }

  public async findDraft(screenId: string, targetApp: string = 'CUSTOMER'): Promise<SduiScreenEntity | null> {
    const record = await this.client.sduiScreen.findFirst({
      where: { screenId, targetApp, status: 'DRAFT' }
    });

    if (!record) return null;
    return this.mapToEntity(record);
  }

  public async getTemplate(templateId: string): Promise<SduiTemplateEntity | null> {
    const template = await this.client.sduiTemplate.findUnique({
      where: { templateId },
    });

    if (!template) return null;

    return new SduiTemplateEntity({
      id: template.id,
      publicId: template.publicId,
      templateId: template.templateId,
      templateType: template.templateType,
      defaultLayoutJson: template.defaultLayoutJson,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    });
  }

  public async upsertTemplate(
    templateId: string,
    templateType: string,
    defaultLayoutJson: any
  ): Promise<SduiTemplateEntity> {
    const record = await this.client.sduiTemplate.upsert({
      where: { templateId },
      update: {
        templateType,
        defaultLayoutJson,
      },
      create: {
        templateId,
        templateType,
        defaultLayoutJson,
      },
    });

    return new SduiTemplateEntity({
      id: record.id,
      publicId: record.publicId,
      templateId: record.templateId,
      templateType: record.templateType,
      defaultLayoutJson: record.defaultLayoutJson,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  // Shared Private Helper Operations
  private async upsertNodeRecord(
    name: string,
    componentType: string,
    schemaJson: any,
    nodeLevel: string,
    supportedProperties?: any,
    supportedActions?: any
  ): Promise<any> {
    return await this.client.sduiComponentRegistry.upsert({
      where: { name },
      update: {
        nodeLevel,
        componentType,
        schemaJson,
        supportedProperties,
        supportedActions,
      },
      create: {
        name,
        nodeLevel,
        componentType,
        schemaJson,
        supportedProperties,
        supportedActions,
      },
    });
  }

  private async findNodeRecord(name: string, nodeLevel: string): Promise<any | null> {
    return await this.client.sduiComponentRegistry.findFirst({
      where: { name, nodeLevel },
    });
  }

  private async listNodeRecords(nodeLevel: string): Promise<any[]> {
    return await this.client.sduiComponentRegistry.findMany({
      where: { nodeLevel },
      orderBy: { id: 'asc' },
    });
  }

  // Component Node Operations
  public async createComponent(
    name: string,
    componentType: string,
    schemaJson: any,
    nodeLevel: string = 'COMPONENT',
    supportedProperties?: any,
    supportedActions?: any
  ): Promise<SduiComponentEntity> {
    const record = await this.upsertNodeRecord(name, componentType, schemaJson, nodeLevel, supportedProperties, supportedActions);
    return new SduiComponentEntity(record);
  }

  public async registerComponent(
    name: string,
    componentType: string,
    schemaJson: any,
    nodeLevel: string = 'COMPONENT',
    supportedProperties?: any,
    supportedActions?: any
  ): Promise<SduiComponentEntity> {
    return this.createComponent(name, componentType, schemaJson, nodeLevel, supportedProperties, supportedActions);
  }

  public async getComponent(name: string): Promise<SduiComponentEntity | null> {
    const record = await this.findNodeRecord(name, 'COMPONENT');
    return record ? new SduiComponentEntity(record) : null;
  }

  public async listComponents(): Promise<SduiComponentEntity[]> {
    const records = await this.listNodeRecords('COMPONENT');
    return records.map(r => new SduiComponentEntity(r));
  }

  // Subcomponent Node Operations
  public async createSubcomponent(
    name: string,
    componentType: string,
    schemaJson: any,
    supportedProperties?: any,
    supportedActions?: any
  ): Promise<SduiSubcomponentEntity> {
    const record = await this.upsertNodeRecord(name, componentType, schemaJson, 'SUBCOMPONENT', supportedProperties, supportedActions);
    return new SduiSubcomponentEntity(record);
  }

  public async getSubcomponent(name: string): Promise<SduiSubcomponentEntity | null> {
    const record = await this.findNodeRecord(name, 'SUBCOMPONENT');
    return record ? new SduiSubcomponentEntity(record) : null;
  }

  public async listSubcomponents(): Promise<SduiSubcomponentEntity[]> {
    const records = await this.listNodeRecords('SUBCOMPONENT');
    return records.map(r => new SduiSubcomponentEntity(r));
  }

  // Child Node Operations
  public async createChild(
    name: string,
    componentType: string,
    schemaJson: any,
    supportedProperties?: any,
    supportedActions?: any
  ): Promise<SduiChildEntity> {
    const record = await this.upsertNodeRecord(name, componentType, schemaJson, 'CHILD', supportedProperties, supportedActions);
    return new SduiChildEntity(record);
  }

  public async getChild(name: string): Promise<SduiChildEntity | null> {
    const record = await this.findNodeRecord(name, 'CHILD');
    return record ? new SduiChildEntity(record) : null;
  }

  public async listChildren(): Promise<SduiChildEntity[]> {
    const records = await this.listNodeRecords('CHILD');
    return records.map(r => new SduiChildEntity(r));
  }

  // ChildrenData Node Operations
  public async createChildrenData(
    name: string,
    componentType: string,
    schemaJson: any,
    supportedProperties?: any,
    supportedActions?: any
  ): Promise<SduiChildrenDataEntity> {
    const record = await this.upsertNodeRecord(name, componentType, schemaJson, 'CHILDREN_DATA', supportedProperties, supportedActions);
    return new SduiChildrenDataEntity(record);
  }

  public async getChildrenData(name: string): Promise<SduiChildrenDataEntity | null> {
    const record = await this.findNodeRecord(name, 'CHILDREN_DATA');
    return record ? new SduiChildrenDataEntity(record) : null;
  }

  public async listChildrenData(): Promise<SduiChildrenDataEntity[]> {
    const records = await this.listNodeRecords('CHILDREN_DATA');
    return records.map(r => new SduiChildrenDataEntity(r));
  }
}
