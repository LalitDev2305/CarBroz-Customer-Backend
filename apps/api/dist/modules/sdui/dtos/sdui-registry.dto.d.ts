import { z } from 'zod';
export declare const createSduiComponentSchema: z.ZodObject<{
    name: z.ZodString;
    componentType: z.ZodString;
    schemaJson: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    supportedProperties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    supportedActions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, z.core.$strip>;
export declare const createSduiSubcomponentSchema: z.ZodObject<{
    name: z.ZodString;
    componentType: z.ZodString;
    schemaJson: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    supportedProperties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    supportedActions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, z.core.$strip>;
export declare const createSduiChildSchema: z.ZodObject<{
    name: z.ZodString;
    componentType: z.ZodString;
    schemaJson: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    supportedProperties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    supportedActions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, z.core.$strip>;
export declare const createSduiChildrenDataSchema: z.ZodObject<{
    name: z.ZodString;
    componentType: z.ZodString;
    schemaJson: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    supportedProperties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    supportedActions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, z.core.$strip>;
export type CreateSduiComponentDto = z.infer<typeof createSduiComponentSchema>;
export type CreateSduiSubcomponentDto = z.infer<typeof createSduiSubcomponentSchema>;
export type CreateSduiChildDto = z.infer<typeof createSduiChildSchema>;
export type CreateSduiChildrenDataDto = z.infer<typeof createSduiChildrenDataSchema>;
export declare const registerSduiComponentSchema: z.ZodObject<{
    name: z.ZodString;
    componentType: z.ZodString;
    schemaJson: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    supportedProperties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    supportedActions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, z.core.$strip>;
export declare const registerSduiSubcomponentSchema: z.ZodObject<{
    name: z.ZodString;
    componentType: z.ZodString;
    schemaJson: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    supportedProperties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    supportedActions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, z.core.$strip>;
export declare const registerSduiChildSchema: z.ZodObject<{
    name: z.ZodString;
    componentType: z.ZodString;
    schemaJson: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    supportedProperties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    supportedActions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, z.core.$strip>;
export declare const registerSduiChildrenDataSchema: z.ZodObject<{
    name: z.ZodString;
    componentType: z.ZodString;
    schemaJson: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    supportedProperties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    supportedActions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, z.core.$strip>;
export type RegisterSduiComponentDto = CreateSduiComponentDto;
export type RegisterSduiSubcomponentDto = CreateSduiSubcomponentDto;
export type RegisterSduiChildDto = CreateSduiChildDto;
export type RegisterSduiChildrenDataDto = CreateSduiChildrenDataDto;
export declare const sduiChildrenDataSchema: z.ZodObject<{
    dataId: z.ZodString;
    dataType: z.ZodString;
    value: z.ZodOptional<z.ZodAny>;
    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, z.core.$strip>;
export declare const sduiChildSchema: z.ZodObject<{
    childId: z.ZodString;
    childType: z.ZodString;
    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
        dataId: z.ZodString;
        dataType: z.ZodString;
        value: z.ZodOptional<z.ZodAny>;
        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const sduiSubcomponentSchema: z.ZodObject<{
    subcomponentId: z.ZodString;
    subcomponentType: z.ZodString;
    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    children: z.ZodOptional<z.ZodArray<z.ZodObject<{
        childId: z.ZodString;
        childType: z.ZodString;
        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
            dataId: z.ZodString;
            dataType: z.ZodString;
            value: z.ZodOptional<z.ZodAny>;
            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const sduiComponentSchema: z.ZodObject<{
    componentId: z.ZodString;
    componentType: z.ZodString;
    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    subcomponents: z.ZodOptional<z.ZodArray<z.ZodObject<{
        subcomponentId: z.ZodString;
        subcomponentType: z.ZodString;
        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        children: z.ZodOptional<z.ZodArray<z.ZodObject<{
            childId: z.ZodString;
            childType: z.ZodString;
            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                dataId: z.ZodString;
                dataType: z.ZodString;
                value: z.ZodOptional<z.ZodAny>;
                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const sduiTemplateSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodString;
    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    components: z.ZodOptional<z.ZodArray<z.ZodObject<{
        componentId: z.ZodString;
        componentType: z.ZodString;
        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        subcomponents: z.ZodOptional<z.ZodArray<z.ZodObject<{
            subcomponentId: z.ZodString;
            subcomponentType: z.ZodString;
            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            children: z.ZodOptional<z.ZodArray<z.ZodObject<{
                childId: z.ZodString;
                childType: z.ZodString;
                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    dataId: z.ZodString;
                    dataType: z.ZodString;
                    value: z.ZodOptional<z.ZodAny>;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                }, z.core.$strip>>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const sduiJsonContractSchema: z.ZodObject<{
    screenId: z.ZodString;
    templateId: z.ZodString;
    templateType: z.ZodString;
    theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    template: z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        components: z.ZodOptional<z.ZodArray<z.ZodObject<{
            componentId: z.ZodString;
            componentType: z.ZodString;
            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            subcomponents: z.ZodOptional<z.ZodArray<z.ZodObject<{
                subcomponentId: z.ZodString;
                subcomponentType: z.ZodString;
                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                children: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    childId: z.ZodString;
                    childType: z.ZodString;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        dataId: z.ZodString;
                        dataType: z.ZodString;
                        value: z.ZodOptional<z.ZodAny>;
                        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    }, z.core.$strip>>>;
                }, z.core.$strip>>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const getSduiScreenSchema: z.ZodObject<{
    screenId: z.ZodString;
    targetApp: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const updateSduiScreenSchema: z.ZodObject<{
    screenId: z.ZodString;
    targetApp: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    isPublished: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    layoutJson: z.ZodObject<{
        screenId: z.ZodString;
        templateId: z.ZodString;
        templateType: z.ZodString;
        theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        template: z.ZodObject<{
            id: z.ZodString;
            type: z.ZodString;
            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            components: z.ZodOptional<z.ZodArray<z.ZodObject<{
                componentId: z.ZodString;
                componentType: z.ZodString;
                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                subcomponents: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    subcomponentId: z.ZodString;
                    subcomponentType: z.ZodString;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    children: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        childId: z.ZodString;
                        childType: z.ZodString;
                        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                        childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                            dataId: z.ZodString;
                            dataType: z.ZodString;
                            value: z.ZodOptional<z.ZodAny>;
                            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                        }, z.core.$strip>>>;
                    }, z.core.$strip>>>;
                }, z.core.$strip>>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const createSduiDraftSchema: z.ZodObject<{
    screenId: z.ZodString;
    targetApp: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    layoutJson: z.ZodObject<{
        screenId: z.ZodString;
        templateId: z.ZodString;
        templateType: z.ZodString;
        theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        template: z.ZodObject<{
            id: z.ZodString;
            type: z.ZodString;
            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            components: z.ZodOptional<z.ZodArray<z.ZodObject<{
                componentId: z.ZodString;
                componentType: z.ZodString;
                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                subcomponents: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    subcomponentId: z.ZodString;
                    subcomponentType: z.ZodString;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    children: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        childId: z.ZodString;
                        childType: z.ZodString;
                        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                        childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                            dataId: z.ZodString;
                            dataType: z.ZodString;
                            value: z.ZodOptional<z.ZodAny>;
                            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                        }, z.core.$strip>>>;
                    }, z.core.$strip>>>;
                }, z.core.$strip>>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>;
    }, z.core.$strip>;
    createdFromVersion: z.ZodOptional<z.ZodNumber>;
    changeDescription: z.ZodOptional<z.ZodString>;
    overwriteExistingDraft: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const updateSduiDraftSchema: z.ZodObject<{
    screenId: z.ZodString;
    targetApp: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    layoutJson: z.ZodObject<{
        screenId: z.ZodString;
        templateId: z.ZodString;
        templateType: z.ZodString;
        theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        template: z.ZodObject<{
            id: z.ZodString;
            type: z.ZodString;
            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            components: z.ZodOptional<z.ZodArray<z.ZodObject<{
                componentId: z.ZodString;
                componentType: z.ZodString;
                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                subcomponents: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    subcomponentId: z.ZodString;
                    subcomponentType: z.ZodString;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    children: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        childId: z.ZodString;
                        childType: z.ZodString;
                        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                        childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                            dataId: z.ZodString;
                            dataType: z.ZodString;
                            value: z.ZodOptional<z.ZodAny>;
                            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                        }, z.core.$strip>>>;
                    }, z.core.$strip>>>;
                }, z.core.$strip>>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>;
    }, z.core.$strip>;
    lockVersion: z.ZodNumber;
    changeDescription: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const publishSduiVersionSchema: z.ZodObject<{
    screenId: z.ZodString;
    targetApp: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    versionNumber: z.ZodNumber;
}, z.core.$strip>;
export declare const archiveSduiVersionSchema: z.ZodObject<{
    screenId: z.ZodString;
    targetApp: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    versionNumber: z.ZodNumber;
}, z.core.$strip>;
export declare const rollbackSduiVersionSchema: z.ZodObject<{
    screenId: z.ZodString;
    targetApp: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    targetVersionNumber: z.ZodNumber;
}, z.core.$strip>;
export declare const compareSduiVersionsSchema: z.ZodObject<{
    screenId: z.ZodString;
    targetApp: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    sourceVersion: z.ZodNumber;
    targetVersion: z.ZodNumber;
}, z.core.$strip>;
export type GetSduiScreenDto = z.infer<typeof getSduiScreenSchema>;
export type SduiJsonContractDto = z.infer<typeof sduiJsonContractSchema>;
export type SduiJsonContract = SduiJsonContractDto;
export type UpdateSduiScreenDto = z.infer<typeof updateSduiScreenSchema>;
export type CreateSduiDraftDto = z.infer<typeof createSduiDraftSchema>;
export type UpdateSduiDraftDto = z.infer<typeof updateSduiDraftSchema>;
export type PublishSduiVersionDto = z.infer<typeof publishSduiVersionSchema>;
export type ArchiveSduiVersionDto = z.infer<typeof archiveSduiVersionSchema>;
export type RollbackSduiVersionDto = z.infer<typeof rollbackSduiVersionSchema>;
export type CompareSduiVersionsDto = z.infer<typeof compareSduiVersionsSchema>;
