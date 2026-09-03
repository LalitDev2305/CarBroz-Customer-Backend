import { type IUseCase, type IRequestContext } from '@carbroz/foundation-kernel';
import { type IPricingRepository } from '../pricing/domain/repositories/IPricingRepository.js';
import { PricingTier, VehicleTypeMultiplierEntity } from '../pricing/domain/PricingTier.js';

export interface ManagePricingRequest {
  action: 'CREATE_TIER' | 'SET_VEHICLE_MULTIPLIER';
  serviceId: number;
  payload: any;
}

export class ManagePricingTierUseCase implements IUseCase<{ context: IRequestContext; data: ManagePricingRequest }, any> {
  constructor(private readonly pricingRepository: IPricingRepository) {}

  async execute(request: { context: IRequestContext; data: ManagePricingRequest }): Promise<any> {
    const user = request.context.authenticatedUser as any;
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
        const multiplier = await this.pricingRepository.upsertVehicleMultiplier(
          serviceId,
          payload.vehicleType.toUpperCase(),
          payload.multiplier
        );
        return multiplier;
      }
      default:
        throw new Error('BAD_REQUEST: Invalid pricing management action');
    }
  }
}
