import { 
  ISduiRegistryRepository, 
  SduiScreenEntity, 
  SduiTemplateEntity, 
  SduiComponentRegistryEntity 
} from '@carbroz/common';
import { PrismaProvider } from '../providers/PrismaProvider.js';

export class PrismaSduiRegistryRepository implements ISduiRegistryRepository {
  constructor(private readonly prismaProvider: PrismaProvider) {}

  private get client(): any {
    return this.prismaProvider.getClient();
  }

  public async findPublishedScreen(screenId: string, targetApp: string = 'CUSTOMER'): Promise<SduiScreenEntity | null> {
    const screen = await this.client.sduiScreen.findFirst({
      where: {
        screenId,
        targetApp,
        isPublished: true,
      },
    });

    if (!screen) return null;

    return new SduiScreenEntity({
      id: screen.id,
      publicId: screen.publicId,
      screenId: screen.screenId,
      targetApp: screen.targetApp,
      layoutJson: screen.layoutJson,
      version: screen.version,
      isPublished: screen.isPublished,
      createdAt: screen.createdAt,
      updatedAt: screen.updatedAt,
    });
  }

  public async upsertScreen(
    screenId: string,
    targetApp: string,
    layoutJson: any,
    isPublished: boolean = true
  ): Promise<SduiScreenEntity> {
    const existing = await this.client.sduiScreen.findFirst({
      where: { screenId, targetApp },
    });

    let record;
    if (existing) {
      record = await this.client.sduiScreen.update({
        where: { id: existing.id },
        data: {
          layoutJson,
          isPublished,
          version: existing.version + 1,
        },
      });
    } else {
      record = await this.client.sduiScreen.create({
        data: {
          screenId,
          targetApp,
          layoutJson,
          isPublished,
          version: 1,
        },
      });
    }

    return new SduiScreenEntity({
      id: record.id,
      publicId: record.publicId,
      screenId: record.screenId,
      targetApp: record.targetApp,
      layoutJson: record.layoutJson,
      version: record.version,
      isPublished: record.isPublished,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
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

  public async registerComponent(
    name: string,
    componentType: string,
    schemaJson: any,
    nodeLevel: string = 'COMPONENT',
    supportedProperties?: any,
    supportedActions?: any
  ): Promise<SduiComponentRegistryEntity> {
    const record = await this.client.sduiComponentRegistry.upsert({
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

    return new SduiComponentRegistryEntity({
      id: record.id,
      publicId: record.publicId,
      name: record.name,
      nodeLevel: record.nodeLevel,
      componentType: record.componentType,
      schemaJson: record.schemaJson,
      supportedProperties: record.supportedProperties,
      supportedActions: record.supportedActions,
      version: record.version,
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
