export class GetSduiVersionHistoryUseCase {
    sduiRegistryRepository;
    constructor(sduiRegistryRepository) {
        this.sduiRegistryRepository = sduiRegistryRepository;
    }
    async execute(input) {
        const { screenId, targetApp = 'CUSTOMER' } = input;
        return await this.sduiRegistryRepository.getVersionHistory(screenId, targetApp);
    }
}
//# sourceMappingURL=GetSduiVersionHistoryUseCase.js.map