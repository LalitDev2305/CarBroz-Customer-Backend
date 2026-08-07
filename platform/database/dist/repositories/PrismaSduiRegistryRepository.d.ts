import { ISduiRegistryRepository, SduiScreenEntity, SduiTemplateEntity, SduiComponentEntity, SduiSubcomponentEntity, SduiChildEntity, SduiChildrenDataEntity, CreateDraftInput, UpdateDraftInput } from '@carbroz/foundation-kernel';
import { PrismaProvider } from '../providers/PrismaProvider.js';
export declare class PrismaSduiRegistryRepository implements ISduiRegistryRepository {
    private readonly prismaProvider;
    constructor(prismaProvider: PrismaProvider);
    private get client();
    private mapToEntity;
    findPublishedScreen(screenId: string, targetApp?: string): Promise<SduiScreenEntity | null>;
    upsertScreen(screenId: string, targetApp: string, layoutJson: any, isPublished?: boolean): Promise<SduiScreenEntity>;
    private createDraftAndPublish;
    createDraft(input: CreateDraftInput): Promise<SduiScreenEntity>;
    updateDraft(input: UpdateDraftInput): Promise<SduiScreenEntity>;
    publishVersion(screenId: string, targetApp: string | undefined, versionNumber: number, publishedBy?: string): Promise<SduiScreenEntity>;
    archiveVersion(screenId: string, targetApp: string | undefined, versionNumber: number): Promise<SduiScreenEntity>;
    rollbackVersion(screenId: string, targetApp: string | undefined, targetVersionNumber: number, publishedBy?: string): Promise<SduiScreenEntity>;
    getVersionHistory(screenId: string, targetApp?: string): Promise<SduiScreenEntity[]>;
    getSpecificVersion(screenId: string, targetApp: string | undefined, versionNumber: number): Promise<SduiScreenEntity | null>;
    findDraft(screenId: string, targetApp?: string): Promise<SduiScreenEntity | null>;
    getTemplate(templateId: string): Promise<SduiTemplateEntity | null>;
    upsertTemplate(templateId: string, templateType: string, defaultLayoutJson: any): Promise<SduiTemplateEntity>;
    private upsertNodeRecord;
    private findNodeRecord;
    private listNodeRecords;
    createComponent(name: string, componentType: string, schemaJson: any, nodeLevel?: string, supportedProperties?: any, supportedActions?: any): Promise<SduiComponentEntity>;
    registerComponent(name: string, componentType: string, schemaJson: any, nodeLevel?: string, supportedProperties?: any, supportedActions?: any): Promise<SduiComponentEntity>;
    getComponent(name: string): Promise<SduiComponentEntity | null>;
    listComponents(): Promise<SduiComponentEntity[]>;
    createSubcomponent(name: string, componentType: string, schemaJson: any, supportedProperties?: any, supportedActions?: any): Promise<SduiSubcomponentEntity>;
    getSubcomponent(name: string): Promise<SduiSubcomponentEntity | null>;
    listSubcomponents(): Promise<SduiSubcomponentEntity[]>;
    createChild(name: string, componentType: string, schemaJson: any, supportedProperties?: any, supportedActions?: any): Promise<SduiChildEntity>;
    getChild(name: string): Promise<SduiChildEntity | null>;
    listChildren(): Promise<SduiChildEntity[]>;
    createChildrenData(name: string, componentType: string, schemaJson: any, supportedProperties?: any, supportedActions?: any): Promise<SduiChildrenDataEntity>;
    getChildrenData(name: string): Promise<SduiChildrenDataEntity | null>;
    listChildrenData(): Promise<SduiChildrenDataEntity[]>;
}
//# sourceMappingURL=PrismaSduiRegistryRepository.d.ts.map