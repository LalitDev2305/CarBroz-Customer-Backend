import { SduiNodeStatus } from './SduiNodeStatus.js';
export interface SduiSubcomponentProps {
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
export declare class SduiSubcomponentEntity {
    readonly id: number;
    readonly publicId: string;
    readonly name: string;
    readonly nodeLevel: "SUBCOMPONENT";
    readonly componentType: string;
    readonly schemaJson: any;
    readonly supportedProperties: any;
    readonly supportedActions: any;
    readonly version: number;
    readonly status: SduiNodeStatus | string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(props: SduiSubcomponentProps);
}
