import { Booking, BookingStatus, IBookingRepository } from '@carbroz/foundation-kernel';
import { CreatePayoutEligibilityUseCase } from '../../payout/use-cases/CreatePayoutEligibilityUseCase.js';
export interface TransitionBookingStatusInput {
    bookingPublicId: string;
    targetStatus: BookingStatus;
    actorId: number;
}
export declare class TransitionBookingStatusUseCase {
    private readonly bookingRepository;
    private readonly createPayoutEligibilityUseCase?;
    constructor(bookingRepository: IBookingRepository, createPayoutEligibilityUseCase?: CreatePayoutEligibilityUseCase | undefined);
    execute(input: TransitionBookingStatusInput): Promise<Booking>;
}
