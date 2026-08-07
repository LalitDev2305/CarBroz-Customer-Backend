import { Booking, IBookingRepository } from '@carbroz/foundation-kernel';
export interface CancelBookingInput {
    bookingPublicId: string;
    actorId: number;
    reason: string;
    isAdmin?: boolean;
}
export declare class CancelBookingUseCase {
    private readonly bookingRepository;
    constructor(bookingRepository: IBookingRepository);
    execute(input: CancelBookingInput): Promise<Booking>;
}
