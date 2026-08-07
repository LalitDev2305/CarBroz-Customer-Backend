import { IDeviceTokenRepository } from '@carbroz/foundation-kernel';
export interface DeactivateDeviceTokenInput {
    userId: number;
    deviceId: string;
}
export declare class DeactivateDeviceTokenUseCase {
    private readonly deviceTokenRepository;
    constructor(deviceTokenRepository: IDeviceTokenRepository);
    execute(input: DeactivateDeviceTokenInput): Promise<void>;
}
