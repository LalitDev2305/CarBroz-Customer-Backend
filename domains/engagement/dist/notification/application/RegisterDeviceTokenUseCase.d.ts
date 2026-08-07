import { DeviceToken } from '../domain/DeviceToken.js';
import { PrismaDeviceTokenRepository } from '../infrastructure/repositories/PrismaDeviceTokenRepository.js';
export interface RegisterTokenInput {
    userId: number;
    deviceId: string;
    token: string;
    platform: 'ANDROID' | 'IOS' | 'WEB';
    appVersion?: string;
}
export declare class RegisterDeviceTokenUseCase {
    private readonly tokenRepository;
    constructor(tokenRepository: PrismaDeviceTokenRepository);
    execute(input: RegisterTokenInput): Promise<DeviceToken>;
}
//# sourceMappingURL=RegisterDeviceTokenUseCase.d.ts.map