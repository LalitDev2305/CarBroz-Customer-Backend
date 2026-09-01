import type { SduiTemplate } from '@carbroz/ui-sdk';

export interface SduiTemplateProps {
  id: number;
  publicId: string;
  templateId: string;
  templateType: string;
  defaultLayoutJson: SduiTemplate;
  createdAt: Date;
  updatedAt: Date;
}

export class SduiTemplateEntity {
  public readonly id: number;
  public readonly publicId: string;
  public readonly templateId: string;
  public readonly templateType: string;
  public readonly defaultLayoutJson: SduiTemplate;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: SduiTemplateProps) {
    this.id = props.id;
    this.publicId = props.publicId;
    this.templateId = props.templateId;
    this.templateType = props.templateType;
    this.defaultLayoutJson = props.defaultLayoutJson;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
