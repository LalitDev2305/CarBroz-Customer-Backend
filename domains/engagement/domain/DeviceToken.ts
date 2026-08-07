export interface DeviceTokenProps {
  id?: number;
  publicId?: string;
  userId: number;
  deviceId: string;
  platform: 'ANDROID' | 'IOS' | 'WEB';
  token: string;
  appVersion?: string | null;
  lastSeenAt?: Date;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class DeviceToken {
  id?: number;
  publicId?: string;
  userId: number;
  deviceId: string;
  platform: 'ANDROID' | 'IOS' | 'WEB';
  token: string;
  appVersion: string | null;
  lastSeenAt: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: DeviceTokenProps) {
    if (!props.userId) throw new Error('DeviceToken must be associated with a userId');
    if (!props.deviceId) throw new Error('DeviceToken deviceId is required');
    if (!props.token) throw new Error('DeviceToken token payload is required');

    this.id = props.id;
    this.publicId = props.publicId;
    this.userId = props.userId;
    this.deviceId = props.deviceId;
    this.platform = props.platform;
    this.token = props.token;
    this.appVersion = props.appVersion ?? null;
    this.lastSeenAt = props.lastSeenAt ?? new Date();
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  touch(appVersion?: string): void {
    this.lastSeenAt = new Date();
    this.isActive = true;
    if (appVersion) this.appVersion = appVersion;
  }

  deactivate(): void {
    this.isActive = false;
  }
}
