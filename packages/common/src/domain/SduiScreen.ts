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

export class SduiScreenEntity {
  public readonly id: number;
  public readonly publicId: string;
  public readonly screenId: string;
  public readonly targetApp: string;
  public readonly layoutJson: any;
  public readonly version: number;
  public readonly isPublished: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: SduiScreenProps) {
    this.id = props.id;
    this.publicId = props.publicId;
    this.screenId = props.screenId;
    this.targetApp = props.targetApp;
    this.layoutJson = props.layoutJson;
    this.version = props.version;
    this.isPublished = props.isPublished;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
