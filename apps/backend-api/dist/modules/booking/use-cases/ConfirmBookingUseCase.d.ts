import { Booking, IBookingRepository } from '@carbroz/common';
export declare class ConfirmBookingUseCase {
    private readonly bookingRepository;
    constructor(bookingRepository: IBookingRepository);
    execute(bookingPublicId: string, customerId: number): Promise<Booking>;
}
