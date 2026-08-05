export class AssignPartnerToBookingUseCase {
    bookingRepository;
    partnerRepository;
    constructor(bookingRepository, partnerRepository) {
        this.bookingRepository = bookingRepository;
        this.partnerRepository = partnerRepository;
    }
    async execute(bookingPublicId, partnerId, adminUserId) {
        const booking = await this.bookingRepository.findByPublicId(bookingPublicId);
        if (!booking) {
            throw new Error('Booking not found');
        }
        const partner = await this.partnerRepository.findById(partnerId);
        if (!partner || partner.status !== 'ACTIVE') {
            throw new Error('Partner not found or not active');
        }
        const conflicting = await this.bookingRepository.findConflictingPartnerBooking(partnerId, booking.slotStartTime, booking.slotEndTime, booking.id);
        if (conflicting) {
            throw new Error('Partner has a conflicting booking assignment during this time slot');
        }
        booking.assignPartner(partnerId, adminUserId);
        return await this.bookingRepository.update(booking);
    }
}
//# sourceMappingURL=AssignPartnerToBookingUseCase.js.map