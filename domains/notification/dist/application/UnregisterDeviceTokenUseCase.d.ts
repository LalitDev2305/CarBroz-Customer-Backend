import { PrismaDeviceTokenRepository } from '../infrastructure/repositories/PrismaDeviceTokenRepository.js';
export interface UnregisterTokenInput {
    userId: number;
    deviceId: string;
}
export declare class UnregisterDeviceTokenUseCase {
    private readonly tokenRepository;
    constructor(tokenRepository: PrismaDeviceTokenRepository);
    execute(input: UnregisterTokenInput): Promise<void>;
}
//# sourceMappingURL=UnregisterDeviceTokenUseCase.d.ts.map