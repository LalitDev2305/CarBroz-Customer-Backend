import { SduiScreenEntity } from '../SduiScreen.js';
import { SduiTemplateEntity } from '../SduiTemplate.js';
import { SduiComponentRegistryEntity } from '../SduiComponent.js';
export interface ISduiRegistryRepository {
    findPublishedScreen(screenId: string, targetApp?: string): Promise<SduiScreenEntity | null>;
    upsertScreen(screenId: string, targetApp: string, layoutJson: any, isPublished?: boolean): Promise<SduiScreenEntity>;
    getTemplate(templateId: string): Promise<SduiTemplateEntity | null>;
    upsertTemplate(templateId: string, templateType: string, defaultLayoutJson: any): Promise<SduiTemplateEntity>;
    registerComponent(name: string, componentType: string, schemaJson: any, nodeLevel?: string, supportedProperties?: any, supportedActions?: any): Promise<SduiComponentRegistryEntity>;
}
