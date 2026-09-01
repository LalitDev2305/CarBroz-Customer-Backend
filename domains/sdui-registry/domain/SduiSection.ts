import { SduiNodeStatus } from './SduiNodeStatus.js';

export interface SduiSectionProps {
  id: number;
  publicId: string;
  name: string;
  componentType: string;
  schemaJson: unknown;
  supportedProperties?: unknown;
  supportedActions?: unknown;
  version?: number;
  status?: SduiNodeStatus | string;
  createdAt: Date;
  updatedAt: Date;
}

export class SduiSectionEntity {
  public readonly id: number;
  public readonly publicId: string;
  public readonly name: string;
  public readonly nodeLevel = 'SECTION' as const;
  public readonly componentType: string;
  public readonly schemaJson: unknown;
  public readonly supportedProperties: unknown;
  public readonly supportedActions: unknown;
  public readonly version: number;
  public readonly status: SduiNodeStatus | string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: SduiSectionProps) {
    this.id = props.id;
    this.publicId = props.publicId;
    this.name = props.name;
    this.componentType = props.componentType;
    this.schemaJson = props.schemaJson;
    this.supportedProperties = props.supportedProperties;
    this.supportedActions = props.supportedActions;
    this.version = props.version ?? 1;
    this.status = props.status ?? 'ACTIVE';
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
