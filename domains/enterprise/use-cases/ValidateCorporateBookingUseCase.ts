import {
  ICorporateAccountRepository,
  ICorporateMemberRepository,
  ICorporateFleetVehicleRepository,
  ICorporateCreditLedgerRepository,
  IUserRepository,
  IVehicleRepository,
  CorporateCreditLedger,
  Money,
} from '@carbroz/common';
import { ValidateCorporateBookingDto } from '../dtos/corporate.dto.js';

export interface CorporateBookingValidationResult {
  eligible: boolean;
  reason?: string;
  corporateAccountId?: number;
  corporateFleetVehicleId?: number;
}

export class ValidateCorporateBookingUseCase {
  constructor(
    private readonly corporateAccountRepo: ICorporateAccountRepository,
    private readonly corporateMemberRepo: ICorporateMemberRepository,
    private readonly fleetVehicleRepo: ICorporateFleetVehicleRepository,
    private readonly creditLedgerRepo: ICorporateCreditLedgerRepository,
    private readonly userRepository: IUserRepository,
    private readonly vehicleRepository: IVehicleRepository
  ) {}

  async execute(dto: ValidateCorporateBookingDto): Promise<CorporateBookingValidationResult> {
    const user = await (this.userRepository as any).findByPublicId
      ? await (this.userRepository as any).findByPublicId(dto.userPublicId)
      : null;

    if (!user) {
      return { eligible: false, reason: 'User not found' };
    }

    const member = await this.corporateMemberRepo.findByUserId(user.id!);
    if (!member || member.status !== 'ACTIVE') {
      return { eligible: false, reason: 'User is not an active corporate member' };
    }

    const account = await this.corporateAccountRepo.findById(member.corporateAccountId);
    if (!account || account.status !== 'ACTIVE') {
      return { eligible: false, reason: 'Corporate account is not active' };
    }

    const vehicle = await this.vehicleRepository.findByPublicId(dto.vehiclePublicId);
    if (!vehicle) {
      return { eligible: false, reason: 'Vehicle not found' };
    }

    const fleetVehicle = await this.fleetVehicleRepo.findByAccountAndVehicle(account.id!, vehicle.id!);
    if (!fleetVehicle || fleetVehicle.status !== 'ACTIVE') {
      return { eligible: false, reason: 'Vehicle is not enrolled in active corporate fleet' };
    }

    const bookingMoney = Money.fromMinor(dto.bookingAmountPaise);
    if (!account.canCoverAmount(bookingMoney)) {
      return { eligible: false, reason: 'Corporate account credit limit exceeded' };
    }

    return {
      eligible: true,
      corporateAccountId: account.id!,
      corporateFleetVehicleId: fleetVehicle.id!,
    };
  }

  async processBookingDebit(corporateAccountId: number, bookingId: number, amountPaise: number): Promise<void> {
    const account = await this.corporateAccountRepo.findById(corporateAccountId);
    if (!account) throw new Error('Corporate account not found');

    const amountBigInt = BigInt(amountPaise);
    const updatedAccount = await this.corporateAccountRepo.updateUtilisedCredit(corporateAccountId, amountBigInt);

    const ledgerEntry = new CorporateCreditLedger({
      corporateAccountId,
      bookingId,
      entryType: 'BOOKING_DEBIT',
      amountPaise: amountBigInt,
      balanceAfterPaise: updatedAccount.creditLimitPaise - updatedAccount.utilisedCreditPaise,
      referenceNotes: `Booking ID ${bookingId} credit debit`,
    });
    await this.creditLedgerRepo.create(ledgerEntry);
  }
}
