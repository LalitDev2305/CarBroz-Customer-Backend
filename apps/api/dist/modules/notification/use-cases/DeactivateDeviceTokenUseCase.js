export class DeactivateDeviceTokenUseCase {
    deviceTokenRepository;
    constructor(deviceTokenRepository) {
        this.deviceTokenRepository = deviceTokenRepository;
    }
    async execute(input) {
        await this.deviceTokenRepository.deactivate(input.userId, input.deviceId);
    }
}
//# sourceMappingURL=DeactivateDeviceTokenUseCase.js.map