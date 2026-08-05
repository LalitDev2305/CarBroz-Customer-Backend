import { SduiScreenEntity, SduiTemplateEntity, SduiComponentEntity, SduiSubcomponentEntity, SduiChildEntity, SduiChildrenDataEntity, ConflictError, NotFoundError, BadRequestError } from '@carbroz/common';
export class PrismaSduiRegistryRepository {
    prismaClient;
    unitOfWorkPrisma = null;
    constructor(prismaClient) {
        this.prismaClient = prismaClient;
    }
    get prisma() {
        return this.unitOfWorkPrisma || this.prismaClient;
    }
    mapToEntity(record) {
        return new SduiScreenEntity({
            id: record.id,
            publicId: record.publicId,
            screenId: record.screenId,
            targetApp: record.targetApp,
            versionNumber: record.versionNumber ?? record.version ?? 1,
            status: record.status ?? (record.isPublished ? 'PUBLISHED' : 'DRAFT'),
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
    async findPublishedScreen(screenId, targetApp = 'CUSTOMER') {
        const screen = await this.client.sduiScreen.findFirst({
            where: {
                screenId,
                targetApp,
                status: 'PUBLISHED',
            },
            orderBy: { versionNumber: 'desc' }
        });
        if (!screen)
            return null;
        return this.mapToEntity(screen);
    }
    async upsertScreen(screenId, targetApp, layoutJson, isPublished = true) {
        if (isPublished) {
            return await this.createDraftAndPublish(screenId, targetApp, layoutJson);
        }
        else {
            const draft = await this.findDraft(screenId, targetApp);
            if (draft) {
                return await this.updateDraft({
                    screenId,
                    targetApp,
                    layoutJson,
                    lockVersion: draft.lockVersion
                });
            }
            else {
                return await this.createDraft({
                    screenId,
                    targetApp,
                    layoutJson
                });
            }
        }
    }
    async createDraftAndPublish(screenId, targetApp, layoutJson) {
        return await this.client.$transaction(async (tx) => {
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
    async createDraft(input) {
        const targetApp = input.targetApp || 'CUSTOMER';
        return await this.client.$transaction(async (tx) => {
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
    async updateDraft(input) {
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
    async publishVersion(screenId, targetApp = 'CUSTOMER', versionNumber, publishedBy = 'admin') {
        return await this.client.$transaction(async (tx) => {
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
    async archiveVersion(screenId, targetApp = 'CUSTOMER', versionNumber) {
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
    async rollbackVersion(screenId, targetApp = 'CUSTOMER', targetVersionNumber, publishedBy = 'admin') {
        return await this.client.$transaction(async (tx) => {
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
    async getVersionHistory(screenId, targetApp = 'CUSTOMER') {
        const records = await this.client.sduiScreen.findMany({
            where: { screenId, targetApp },
            orderBy: { versionNumber: 'desc' }
        });
        return records.map((r) => this.mapToEntity(r));
    }
    async getSpecificVersion(screenId, targetApp = 'CUSTOMER', versionNumber) {
        const record = await this.client.sduiScreen.findFirst({
            where: { screenId, targetApp, versionNumber }
        });
        if (!record)
            return null;
        return this.mapToEntity(record);
    }
    async findDraft(screenId, targetApp = 'CUSTOMER') {
        const record = await this.client.sduiScreen.findFirst({
            where: { screenId, targetApp, status: 'DRAFT' }
        });
        if (!record)
            return null;
        return this.mapToEntity(record);
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
    // Shared Private Helper Operations
    async upsertNodeRecord(name, componentType, schemaJson, nodeLevel, supportedProperties, supportedActions) {
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
    async findNodeRecord(name, nodeLevel) {
        return await this.client.sduiComponentRegistry.findFirst({
            where: { name, nodeLevel },
        });
    }
    async listNodeRecords(nodeLevel) {
        return await this.client.sduiComponentRegistry.findMany({
            where: { nodeLevel },
            orderBy: { id: 'asc' },
        });
    }
    // Component Node Operations
    async createComponent(name, componentType, schemaJson, nodeLevel = 'COMPONENT', supportedProperties, supportedActions) {
        const record = await this.upsertNodeRecord(name, componentType, schemaJson, nodeLevel, supportedProperties, supportedActions);
        return new SduiComponentEntity(record);
    }
    async registerComponent(name, componentType, schemaJson, nodeLevel = 'COMPONENT', supportedProperties, supportedActions) {
        return this.createComponent(name, componentType, schemaJson, nodeLevel, supportedProperties, supportedActions);
    }
    async getComponent(name) {
        const record = await this.findNodeRecord(name, 'COMPONENT');
        return record ? new SduiComponentEntity(record) : null;
    }
    async listComponents() {
        const records = await this.listNodeRecords('COMPONENT');
        return records.map(r => new SduiComponentEntity(r));
    }
    // Subcomponent Node Operations
    async createSubcomponent(name, componentType, schemaJson, supportedProperties, supportedActions) {
        const record = await this.upsertNodeRecord(name, componentType, schemaJson, 'SUBCOMPONENT', supportedProperties, supportedActions);
        return new SduiSubcomponentEntity(record);
    }
    async getSubcomponent(name) {
        const record = await this.findNodeRecord(name, 'SUBCOMPONENT');
        return record ? new SduiSubcomponentEntity(record) : null;
    }
    async listSubcomponents() {
        const records = await this.listNodeRecords('SUBCOMPONENT');
        return records.map(r => new SduiSubcomponentEntity(r));
    }
    // Child Node Operations
    async createChild(name, componentType, schemaJson, supportedProperties, supportedActions) {
        const record = await this.upsertNodeRecord(name, componentType, schemaJson, 'CHILD', supportedProperties, supportedActions);
        return new SduiChildEntity(record);
    }
    async getChild(name) {
        const record = await this.findNodeRecord(name, 'CHILD');
        return record ? new SduiChildEntity(record) : null;
    }
    async listChildren() {
        const records = await this.listNodeRecords('CHILD');
        return records.map(r => new SduiChildEntity(r));
    }
    // ChildrenData Node Operations
    async createChildrenData(name, componentType, schemaJson, supportedProperties, supportedActions) {
        const record = await this.upsertNodeRecord(name, componentType, schemaJson, 'CHILDREN_DATA', supportedProperties, supportedActions);
        return new SduiChildrenDataEntity(record);
    }
    async getChildrenData(name) {
        const record = await this.findNodeRecord(name, 'CHILDREN_DATA');
        return record ? new SduiChildrenDataEntity(record) : null;
    }
    async listChildrenData() {
        const records = await this.listNodeRecords('CHILDREN_DATA');
        return records.map(r => new SduiChildrenDataEntity(r));
    }
}
//# sourceMappingURL=PrismaSduiRegistryRepository.js.map