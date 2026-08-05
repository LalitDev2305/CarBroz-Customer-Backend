import { Booking, IBookingRepository, IPartnerRepository } from '@carbroz/common';
export declare class AssignPartnerToBookingUseCase {
    private readonly bookingRepository;
    private readonly partnerRepository;
    constructor(bookingRepository: IBookingRepository, partnerRepository: IPartnerRepository);
    execute(bookingPublicId: string, partnerId: number, adminUserId: number): Promise<Booking>;
}
