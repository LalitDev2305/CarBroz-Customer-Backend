import { DeviceToken } from '@carbroz/foundation-kernel';
export class RegisterDeviceTokenUseCase {
    deviceTokenRepository;
    constructor(deviceTokenRepository) {
        this.deviceTokenRepository = deviceTokenRepository;
    }
    async execute(input) {
        const deviceToken = new DeviceToken({
            userId: input.userId,
            deviceId: input.deviceId,
            platform: input.platform,
            token: input.token,
            appVersion: input.appVersion,
            isActive: true,
        });
        return await this.deviceTokenRepository.upsert(deviceToken);
    }
}
//# sourceMappingURL=RegisterDeviceTokenUseCase.js.map