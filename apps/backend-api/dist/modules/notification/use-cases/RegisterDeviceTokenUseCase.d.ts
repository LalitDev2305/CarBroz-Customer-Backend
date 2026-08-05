import { DeviceToken, IDeviceTokenRepository } from '@carbroz/common';
export interface RegisterDeviceTokenInput {
    userId: number;
    deviceId: string;
    platform: 'ANDROID' | 'IOS' | 'WEB';
    token: string;
    appVersion?: string;
}
export declare class RegisterDeviceTokenUseCase {
    private readonly deviceTokenRepository;
    constructor(deviceTokenRepository: IDeviceTokenRepository);
    execute(input: RegisterDeviceTokenInput): Promise<DeviceToken>;
}
