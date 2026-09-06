import type { ICorporateAccountRepository } from '../domain/repositories/ICorporateAccountRepository.js';
import type { ICorporateMemberRepository } from '../domain/repositories/ICorporateMemberRepository.js';
import type { ICorporateFleetVehicleRepository } from '../domain/repositories/ICorporateFleetVehicleRepository.js';
import { IUserRepository } from '@carbroz/domain-identity';
import { IVehicleRepository } from '@carbroz/domain-customer';
import { Money } from '@carbroz/foundation-kernel';
import { ValidateCorporateBookingDto } from '../dtos/corporate.dto.js';

export interface CorporateBookingValidationResult {
  eligible: boolean;
  reason?: string;
  corporateAccountId?: number;
  corporateFleetVehicleId?: number;
}

/** Enterprise-owned corporate membership, fleet and credit-eligibility policy. */
export class ValidateCorporateBookingUseCase {
  constructor(
    private readonly corporateAccountRepo: ICorporateAccountRepository,
    private readonly corporateMemberRepo: ICorporateMemberRepository,
    private readonly fleetVehicleRepo: ICorporateFleetVehicleRepository,
    private readonly userRepository: IUserRepository,
    private readonly vehicleRepository: IVehicleRepository,
  ) {}

  async execute(dto: ValidateCorporateBookingDto): Promise<CorporateBookingValidationResult> {
    const user = await (this.userRepository as any).findByPublicId
      ? await (this.userRepository as any).findByPublicId(dto.userPublicId)
      : null;

    if (!user) return { eligible: false, reason: 'User not found' };

    const member = await this.corporateMemberRepo.findByUserId(user.id!);
    if (!member || member.status !== 'ACTIVE') {
      return { eligible: false, reason: 'User is not an active corporate member' };
    }

    const account = await this.corporateAccountRepo.findById(member.corporateAccountId);
    if (!account || account.status !== 'ACTIVE') {
      return { eligible: false, reason: 'Corporate account is not active' };
    }

    const vehicle = await this.vehicleRepository.findByPublicId(dto.vehiclePublicId);
    if (!vehicle) return { eligible: false, reason: 'Vehicle not found' };

    const fleetVehicle = await this.fleetVehicleRepo.findByAccountAndVehicle(account.id!, vehicle.id!);
    if (!fleetVehicle || fleetVehicle.status !== 'ACTIVE') {
      return { eligible: false, reason: 'Vehicle is not enrolled in active corporate fleet' };
    }

    if (!account.canCoverAmount(Money.fromMinor(dto.bookingAmountPaise))) {
      return { eligible: false, reason: 'Corporate account credit limit exceeded' };
    }

    return {
      eligible: true,
      corporateAccountId: account.id!,
      corporateFleetVehicleId: fleetVehicle.id!,
    };
  }
}
