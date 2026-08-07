import { Booking, IBookingRepository, IPartnerRepository } from '@carbroz/foundation-kernel';
export declare class AssignPartnerToBookingUseCase {
    private readonly bookingRepository;
    private readonly partnerRepository;
    constructor(bookingRepository: IBookingRepository, partnerRepository: IPartnerRepository);
    execute(bookingPublicId: string, partnerId: number, adminUserId: number): Promise<Booking>;
}
