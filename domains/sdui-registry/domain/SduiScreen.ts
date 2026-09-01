import type { SduiScreen, SduiTargetApp } from '@carbroz/sdui-engine';

export type SduiScreenStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface SduiScreenProps {
  id: number;
  publicId: string;
  screenId: string;
  targetApp?: SduiTargetApp;
  versionNumber?: number;
  status?: SduiScreenStatus;
  layoutJson: SduiScreen;
  lockVersion?: number;
  publishedAt?: Date | null;
  publishedBy?: string | null;
  createdFromVersion?: number | null;
  changeDescription?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class SduiScreenEntity {
  public readonly id: number;
  public readonly publicId: string;
  public readonly screenId: string;
  public readonly targetApp: SduiTargetApp;
  public readonly versionNumber: number;
  public readonly status: SduiScreenStatus;
  public readonly layoutJson: SduiScreen;
  public readonly lockVersion: number;
  public readonly publishedAt: Date | null;
  public readonly publishedBy: string | null;
  public readonly createdFromVersion: number | null;
  public readonly changeDescription: string | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: SduiScreenProps) {
    this.id = props.id;
    this.publicId = props.publicId;
    this.screenId = props.screenId;
    this.targetApp = props.targetApp ?? 'CUSTOMER';
    this.versionNumber = props.versionNumber ?? 1;
    this.status = props.status ?? 'DRAFT';
    this.layoutJson = props.layoutJson;
    this.lockVersion = props.lockVersion ?? 1;
    this.publishedAt = props.publishedAt ?? null;
    this.publishedBy = props.publishedBy ?? null;
    this.createdFromVersion = props.createdFromVersion ?? null;
    this.changeDescription = props.changeDescription ?? null;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
