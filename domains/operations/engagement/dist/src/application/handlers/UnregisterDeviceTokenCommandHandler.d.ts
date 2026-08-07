import { PrismaDeviceTokenRepository } from '../../infrastructure/persistence/prisma/PrismaDeviceTokenRepository.js';
export interface UnregisterTokenInput {
    userId: number;
    deviceId: string;
}
export declare class UnregisterDeviceTokenCommandHandler {
    private readonly tokenRepository;
    constructor(tokenRepository: PrismaDeviceTokenRepository);
    execute(input: UnregisterTokenInput): Promise<void>;
}
