import { IBookingRepository } from '@carbroz/foundation-kernel';
export declare class ExpirePendingBookingsUseCase {
    private readonly bookingRepository;
    constructor(bookingRepository: IBookingRepository);
    execute(): Promise<number>;
}
