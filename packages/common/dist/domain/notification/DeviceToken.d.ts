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
export declare class DeviceToken {
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
    constructor(props: DeviceTokenProps);
    touch(appVersion?: string): void;
    deactivate(): void;
}
