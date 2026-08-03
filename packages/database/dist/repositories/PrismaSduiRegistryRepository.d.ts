import { ISduiRegistryRepository, SduiScreenEntity, SduiTemplateEntity, SduiComponentRegistryEntity } from '@carbroz/common';
import { PrismaProvider } from '../providers/PrismaProvider.js';
export declare class PrismaSduiRegistryRepository implements ISduiRegistryRepository {
    private readonly prismaProvider;
    constructor(prismaProvider: PrismaProvider);
    private get client();
    findPublishedScreen(screenId: string, targetApp?: string): Promise<SduiScreenEntity | null>;
    upsertScreen(screenId: string, targetApp: string, layoutJson: any, isPublished?: boolean): Promise<SduiScreenEntity>;
    getTemplate(templateId: string): Promise<SduiTemplateEntity | null>;
    upsertTemplate(templateId: string, templateType: string, defaultLayoutJson: any): Promise<SduiTemplateEntity>;
    registerComponent(name: string, componentType: string, schemaJson: any, nodeLevel?: string, supportedProperties?: any, supportedActions?: any): Promise<SduiComponentRegistryEntity>;
}
