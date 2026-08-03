import { IUseCase, IRequestContext, ICatalogRepository, IPricingRepository } from '@carbroz/common';
export interface CalculatePriceRequest {
    serviceId: number;
    vehicleType: string;
    addonIds?: number[];
}
export interface CalculatedPriceResult {
    serviceId: number;
    serviceName: string;
    vehicleType: string;
    basePrice: number;
    vehicleMultiplier: number;
    adjustedBasePrice: number;
    addonsTotal: number;
    addons: Array<{
        id: number;
        name: string;
        price: number;
    }>;
    totalPrice: number;
}
export declare class CalculateServicePriceUseCase implements IUseCase<{
    context?: IRequestContext;
    data: CalculatePriceRequest;
}, CalculatedPriceResult> {
    private readonly catalogRepository;
    private readonly pricingRepository;
    constructor(catalogRepository: ICatalogRepository, pricingRepository: IPricingRepository);
    execute(request: {
        context?: IRequestContext;
        data: CalculatePriceRequest;
    }): Promise<CalculatedPriceResult>;
}
