import { SduiNodeStatus } from './SduiNodeStatus.js';
export interface SduiComponentProps {
    id: number;
    publicId: string;
    name: string;
    componentType: string;
    schemaJson: any;
    supportedProperties?: any;
    supportedActions?: any;
    version?: number;
    status?: SduiNodeStatus | string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class SduiComponentEntity {
    readonly id: number;
    readonly publicId: string;
    readonly name: string;
    readonly nodeLevel: "COMPONENT";
    readonly componentType: string;
    readonly schemaJson: any;
    readonly supportedProperties: any;
    readonly supportedActions: any;
    readonly version: number;
    readonly status: SduiNodeStatus | string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(props: SduiComponentProps);
}
export type SduiComponentRegistryProps = SduiComponentProps;
export type SduiComponentRegistryEntity = SduiComponentEntity;
export declare const SduiComponentRegistryEntity: typeof SduiComponentEntity;
