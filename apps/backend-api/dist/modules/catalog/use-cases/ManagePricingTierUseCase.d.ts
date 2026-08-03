import { IUseCase, IRequestContext, IPricingRepository } from '@carbroz/common';
export interface ManagePricingRequest {
    action: 'CREATE_TIER' | 'SET_VEHICLE_MULTIPLIER';
    serviceId: number;
    payload: any;
}
export declare class ManagePricingTierUseCase implements IUseCase<{
    context: IRequestContext;
    data: ManagePricingRequest;
}, any> {
    private readonly pricingRepository;
    constructor(pricingRepository: IPricingRepository);
    execute(request: {
        context: IRequestContext;
        data: ManagePricingRequest;
    }): Promise<any>;
}
