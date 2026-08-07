import { DeviceToken } from '../domain/DeviceToken.js';
export class RegisterDeviceTokenUseCase {
    tokenRepository;
    constructor(tokenRepository) {
        this.tokenRepository = tokenRepository;
    }
    async execute(input) {
        const token = new DeviceToken({
            userId: input.userId,
            deviceId: input.deviceId,
            token: input.token,
            platform: input.platform,
            appVersion: input.appVersion || null,
            isActive: true,
            lastSeenAt: new Date(),
        });
        return this.tokenRepository.upsert(token);
    }
}
//# sourceMappingURL=RegisterDeviceTokenUseCase.js.map