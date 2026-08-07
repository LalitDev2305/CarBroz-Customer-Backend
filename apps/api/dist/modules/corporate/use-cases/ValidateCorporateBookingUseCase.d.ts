import { ICorporateAccountRepository, ICorporateMemberRepository, ICorporateFleetVehicleRepository, ICorporateCreditLedgerRepository, IUserRepository, IVehicleRepository } from '@carbroz/foundation-kernel';
import { ValidateCorporateBookingDto } from '../dtos/corporate.dto.js';
export interface CorporateBookingValidationResult {
    eligible: boolean;
    reason?: string;
    corporateAccountId?: number;
    corporateFleetVehicleId?: number;
}
export declare class ValidateCorporateBookingUseCase {
    private readonly corporateAccountRepo;
    private readonly corporateMemberRepo;
    private readonly fleetVehicleRepo;
    private readonly creditLedgerRepo;
    private readonly userRepository;
    private readonly vehicleRepository;
    constructor(corporateAccountRepo: ICorporateAccountRepository, corporateMemberRepo: ICorporateMemberRepository, fleetVehicleRepo: ICorporateFleetVehicleRepository, creditLedgerRepo: ICorporateCreditLedgerRepository, userRepository: IUserRepository, vehicleRepository: IVehicleRepository);
    execute(dto: ValidateCorporateBookingDto): Promise<CorporateBookingValidationResult>;
    processBookingDebit(corporateAccountId: number, bookingId: number, amountPaise: number): Promise<void>;
}
