import { DeviceToken } from '../../domain/entities/DeviceToken.js';
import { PrismaDeviceTokenRepository } from '../../infrastructure/persistence/prisma/PrismaDeviceTokenRepository.js';
export interface RegisterTokenInput {
    userId: number;
    deviceId: string;
    token: string;
    platform: 'ANDROID' | 'IOS' | 'WEB';
    appVersion?: string;
}
export declare class RegisterDeviceTokenCommandHandler {
    private readonly tokenRepository;
    constructor(tokenRepository: PrismaDeviceTokenRepository);
    execute(input: RegisterTokenInput): Promise<DeviceToken>;
}
