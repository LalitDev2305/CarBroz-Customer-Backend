export class UnregisterDeviceTokenUseCase {
    tokenRepository;
    constructor(tokenRepository) {
        this.tokenRepository = tokenRepository;
    }
    async execute(input) {
        await this.tokenRepository.deactivate(input.userId, input.deviceId);
    }
}
//# sourceMappingURL=UnregisterDeviceTokenUseCase.js.map