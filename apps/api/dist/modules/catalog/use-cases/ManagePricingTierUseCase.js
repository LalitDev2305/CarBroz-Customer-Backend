export class ManagePricingTierUseCase {
    pricingRepository;
    constructor(pricingRepository) {
        this.pricingRepository = pricingRepository;
    }
    async execute(request) {
        const user = request.context.authenticatedUser;
        if (!user?.isAdmin) {
            throw new Error('FORBIDDEN: Admin privileges required');
        }
        const { action, serviceId, payload } = request.data;
        switch (action) {
            case 'CREATE_TIER': {
                const tier = await this.pricingRepository.createPricingTier({
                    serviceId,
                    ...payload
                });
                return tier;
            }
            case 'SET_VEHICLE_MULTIPLIER': {
                const multiplier = await this.pricingRepository.upsertVehicleMultiplier(serviceId, payload.vehicleType.toUpperCase(), payload.multiplier);
                return multiplier;
            }
            default:
                throw new Error('BAD_REQUEST: Invalid pricing management action');
        }
    }
}
//# sourceMappingURL=ManagePricingTierUseCase.js.map