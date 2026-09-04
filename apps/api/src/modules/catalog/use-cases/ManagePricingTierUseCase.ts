import { IUseCase, IPricingRepository } from '@carbroz/common';
import type { ExecutionContext } from '@carbroz/foundation-kernel';

export interface ManagePricingRequest {
  action: 'CREATE_TIER' | 'SET_VEHICLE_MULTIPLIER';
  serviceId: number;
  payload: any;
}

/** Admin-only pricing mutation orchestration using the canonical execution context. */
export class ManagePricingTierUseCase implements IUseCase<{ context: ExecutionContext; data: ManagePricingRequest }, unknown> {
  constructor(private readonly pricingRepository: IPricingRepository) {}

  async execute(request: { context: ExecutionContext; data: ManagePricingRequest }): Promise<unknown> {
    const actor = request.context.actor;
    if (actor?.kind !== 'ADMIN' && !actor?.roles.includes('ADMIN')) {
      throw new Error('FORBIDDEN: Admin privileges required');
    }

    const { action, serviceId, payload } = request.data;

    switch (action) {
      case 'CREATE_TIER':
        return this.pricingRepository.createPricingTier({ serviceId, ...payload });
      case 'SET_VEHICLE_MULTIPLIER':
        return this.pricingRepository.upsertVehicleMultiplier(
          serviceId,
          payload.vehicleType.toUpperCase(),
          payload.multiplier
        );
      default:
        throw new Error('BAD_REQUEST: Invalid pricing management action');
    }
  }
}
