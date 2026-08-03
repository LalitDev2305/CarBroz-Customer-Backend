export interface SduiComponentRegistryProps {
    id: number;
    publicId: string;
    name: string;
    nodeLevel?: string;
    componentType: string;
    schemaJson: any;
    supportedProperties?: any;
    supportedActions?: any;
    version?: number;
    status?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class SduiComponentRegistryEntity {
    readonly id: number;
    readonly publicId: string;
    readonly name: string;
    readonly nodeLevel: string;
    readonly componentType: string;
    readonly schemaJson: any;
    readonly supportedProperties: any;
    readonly supportedActions: any;
    readonly version: number;
    readonly status: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(props: SduiComponentRegistryProps);
}
