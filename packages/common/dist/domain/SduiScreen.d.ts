export interface SduiScreenProps {
    id: number;
    publicId: string;
    screenId: string;
    targetApp: string;
    layoutJson: any;
    version: number;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class SduiScreenEntity {
    readonly id: number;
    readonly publicId: string;
    readonly screenId: string;
    readonly targetApp: string;
    readonly layoutJson: any;
    readonly version: number;
    readonly isPublished: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(props: SduiScreenProps);
}
