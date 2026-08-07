import { CorporateCreditLedger, Money, } from '@carbroz/foundation-kernel';
export class ValidateCorporateBookingUseCase {
    corporateAccountRepo;
    corporateMemberRepo;
    fleetVehicleRepo;
    creditLedgerRepo;
    userRepository;
    vehicleRepository;
    constructor(corporateAccountRepo, corporateMemberRepo, fleetVehicleRepo, creditLedgerRepo, userRepository, vehicleRepository) {
        this.corporateAccountRepo = corporateAccountRepo;
        this.corporateMemberRepo = corporateMemberRepo;
        this.fleetVehicleRepo = fleetVehicleRepo;
        this.creditLedgerRepo = creditLedgerRepo;
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
    }
    async execute(dto) {
        const user = await this.userRepository.findByPublicId
            ? await this.userRepository.findByPublicId(dto.userPublicId)
            : null;
        if (!user) {
            return { eligible: false, reason: 'User not found' };
        }
        const member = await this.corporateMemberRepo.findByUserId(user.id);
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
        const fleetVehicle = await this.fleetVehicleRepo.findByAccountAndVehicle(account.id, vehicle.id);
        if (!fleetVehicle || fleetVehicle.status !== 'ACTIVE') {
            return { eligible: false, reason: 'Vehicle is not enrolled in active corporate fleet' };
        }
        const bookingMoney = Money.fromPaise(dto.bookingAmountPaise);
        if (!account.canCoverAmount(bookingMoney)) {
            return { eligible: false, reason: 'Corporate account credit limit exceeded' };
        }
        return {
            eligible: true,
            corporateAccountId: account.id,
            corporateFleetVehicleId: fleetVehicle.id,
        };
    }
    async processBookingDebit(corporateAccountId, bookingId, amountPaise) {
        const account = await this.corporateAccountRepo.findById(corporateAccountId);
        if (!account)
            throw new Error('Corporate account not found');
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
//# sourceMappingURL=ValidateCorporateBookingUseCase.js.map