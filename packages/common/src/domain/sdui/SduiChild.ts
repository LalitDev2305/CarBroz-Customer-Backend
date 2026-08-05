import { SduiNodeStatus } from './SduiNodeStatus.js';

export interface SduiChildProps {
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

export class SduiChildEntity {
  public readonly id: number;
  public readonly publicId: string;
  public readonly name: string;
  public readonly nodeLevel = 'CHILD' as const;
  public readonly componentType: string;
  public readonly schemaJson: any;
  public readonly supportedProperties: any;
  public readonly supportedActions: any;
  public readonly version: number;
  public readonly status: SduiNodeStatus | string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: SduiChildProps) {
    this.id = props.id;
    this.publicId = props.publicId;
    this.name = props.name;
    this.componentType = props.componentType;
    this.schemaJson = props.schemaJson;
    this.supportedProperties = props.supportedProperties;
    this.supportedActions = props.supportedActions;
    this.version = props.version || 1;
    this.status = props.status || 'ACTIVE';
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
