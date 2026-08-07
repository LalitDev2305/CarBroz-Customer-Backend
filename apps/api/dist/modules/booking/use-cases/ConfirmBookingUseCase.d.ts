import { Booking, IBookingRepository } from '@carbroz/foundation-kernel';
export declare class ConfirmBookingUseCase {
    private readonly bookingRepository;
    constructor(bookingRepository: IBookingRepository);
    execute(bookingPublicId: string, customerId: number): Promise<Booking>;
}
