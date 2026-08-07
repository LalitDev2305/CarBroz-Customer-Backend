export class UnregisterDeviceTokenCommandHandler {
    tokenRepository;
    constructor(tokenRepository) {
        this.tokenRepository = tokenRepository;
    }
    async execute(input) {
        await this.tokenRepository.deactivate(input.userId, input.deviceId);
    }
}
//# sourceMappingURL=UnregisterDeviceTokenCommandHandler.js.map