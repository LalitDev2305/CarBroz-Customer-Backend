export class CalculateServicePriceUseCase {
    catalogRepository;
    pricingRepository;
    constructor(catalogRepository, pricingRepository) {
        this.catalogRepository = catalogRepository;
        this.pricingRepository = pricingRepository;
    }
    async execute(request) {
        const { serviceId, vehicleType, addonIds = [] } = request.data;
        const service = await this.catalogRepository.findServiceById(serviceId);
        if (!service || !service.isActive) {
            throw new Error('NOT_FOUND: Service not found or inactive');
        }
        // Get Vehicle Multiplier
        const multiplierEntity = await this.pricingRepository.findVehicleMultiplier(serviceId, vehicleType.toUpperCase());
        const vehicleMultiplier = multiplierEntity ? multiplierEntity.multiplier : 1.0;
        const adjustedBasePrice = Math.round(service.basePrice * vehicleMultiplier);
        // Get Selected Addons
        let addonsTotal = 0;
        const selectedAddons = [];
        if (addonIds.length > 0) {
            const addons = await this.catalogRepository.findAddonsByIds(addonIds);
            for (const addon of addons) {
                if (addon.serviceId === serviceId && addon.isActive) {
                    addonsTotal += addon.price;
                    selectedAddons.push({
                        id: addon.id,
                        name: addon.name,
                        price: addon.price
                    });
                }
            }
        }
        const totalPrice = adjustedBasePrice + addonsTotal;
        return {
            serviceId: service.id,
            serviceName: service.name,
            vehicleType: vehicleType.toUpperCase(),
            basePrice: service.basePrice,
            vehicleMultiplier,
            adjustedBasePrice,
            addonsTotal,
            addons: selectedAddons,
            totalPrice
        };
    }
}
//# sourceMappingURL=CalculateServicePriceUseCase.js.map