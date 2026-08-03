import { SduiScreenEntity, SduiTemplateEntity, SduiComponentRegistryEntity } from '@carbroz/common';
export class PrismaSduiRegistryRepository {
    prismaProvider;
    constructor(prismaProvider) {
        this.prismaProvider = prismaProvider;
    }
    get client() {
        return this.prismaProvider.getClient();
    }
    async findPublishedScreen(screenId, targetApp = 'CUSTOMER') {
        const screen = await this.client.sduiScreen.findFirst({
            where: {
                screenId,
                targetApp,
                isPublished: true,
            },
        });
        if (!screen)
            return null;
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
    async upsertScreen(screenId, targetApp, layoutJson, isPublished = true) {
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
        }
        else {
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
    async getTemplate(templateId) {
        const template = await this.client.sduiTemplate.findUnique({
            where: { templateId },
        });
        if (!template)
            return null;
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
    async upsertTemplate(templateId, templateType, defaultLayoutJson) {
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
    async registerComponent(name, componentType, schemaJson, nodeLevel = 'COMPONENT', supportedProperties, supportedActions) {
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
//# sourceMappingURL=PrismaSduiRegistryRepository.js.map