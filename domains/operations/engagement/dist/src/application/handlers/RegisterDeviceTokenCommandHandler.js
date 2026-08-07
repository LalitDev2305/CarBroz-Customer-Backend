import { DeviceToken } from '../../domain/entities/DeviceToken.js';
export class RegisterDeviceTokenCommandHandler {
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
//# sourceMappingURL=RegisterDeviceTokenCommandHandler.js.map