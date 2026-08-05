export type SduiScreenStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export interface SduiScreenProps {
    id: number;
    publicId: string;
    screenId: string;
    targetApp: string;
    versionNumber: number;
    status: SduiScreenStatus;
    layoutJson: any;
    lockVersion: number;
    publishedAt?: Date | null;
    publishedBy?: string | null;
    createdFromVersion?: number | null;
    changeDescription?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare class SduiScreenEntity {
    readonly id: number;
    readonly publicId: string;
    readonly screenId: string;
    readonly targetApp: string;
    readonly versionNumber: number;
    readonly status: SduiScreenStatus;
    readonly layoutJson: any;
    readonly lockVersion: number;
    readonly publishedAt?: Date | null;
    readonly publishedBy?: string | null;
    readonly createdFromVersion?: number | null;
    readonly changeDescription?: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(props: SduiScreenProps);
    get isPublished(): boolean;
    get version(): number;
}
