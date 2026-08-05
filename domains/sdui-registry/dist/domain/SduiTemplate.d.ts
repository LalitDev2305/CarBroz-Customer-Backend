export interface SduiTemplateProps {
    id: number;
    publicId: string;
    templateId: string;
    templateType: string;
    defaultLayoutJson: any;
    createdAt: Date;
    updatedAt: Date;
}
export declare class SduiTemplateEntity {
    readonly id: number;
    readonly publicId: string;
    readonly templateId: string;
    readonly templateType: string;
    readonly defaultLayoutJson: any;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(props: SduiTemplateProps);
}
//# sourceMappingURL=SduiTemplate.d.ts.map