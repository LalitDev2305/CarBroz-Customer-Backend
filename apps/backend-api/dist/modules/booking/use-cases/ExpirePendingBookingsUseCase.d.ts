import { IBookingRepository } from '@carbroz/common';
export declare class ExpirePendingBookingsUseCase {
    private readonly bookingRepository;
    constructor(bookingRepository: IBookingRepository);
    execute(): Promise<number>;
}
