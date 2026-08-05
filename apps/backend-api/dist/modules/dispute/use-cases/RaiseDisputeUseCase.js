import { Dispute, ErrorCode, Money, } from '@carbroz/common';
export class RaiseDisputeUseCase {
    disputeRepository;
    bookingRepository;
    notificationService;
    auditLogService;
    constructor(disputeRepository, bookingRepository, notificationService, auditLogService) {
        this.disputeRepository = disputeRepository;
        this.bookingRepository = bookingRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }
    async execute(command) {
        const booking = await this.bookingRepository.findByPublicId(command.bookingPublicId);
        if (!booking) {
            throw new Error(ErrorCode.BOOKING_NOT_FOUND);
        }
        // Ownership check: actor must be booking's customer or assigned partner
        if (command.actorType === 'CUSTOMER' && booking.customerId !== command.actorId) {
            throw new Error(ErrorCode.FORBIDDEN);
        }
        if (command.actorType === 'PARTNER' && booking.partnerId !== command.actorId) {
            throw new Error(ErrorCode.FORBIDDEN);
        }
        // Check duplicate active dispute
        const activeDispute = await this.disputeRepository.findActiveByBookingId(booking.id);
        if (activeDispute) {
            throw new Error('An active dispute already exists for this booking');
        }
        const dispute = new Dispute({
            bookingId: booking.id,
            raisedByActorId: command.actorId,
            raisedByActorType: command.actorType,
            disputeReason: command.disputeReason,
            description: command.description,
            requestedRefundAmount: Money.fromPaise(command.requestedRefundPaise),
        });
        const savedDispute = await this.disputeRepository.create(dispute);
        // Audit Logging
        await this.auditLogService.log({
            actorId: command.actorId,
            actorType: command.actorType,
            action: 'DISPUTE_RAISE',
            resource: 'Dispute',
            resourcePublicId: savedDispute.publicId,
            newValue: {
                bookingPublicId: command.bookingPublicId,
                reason: command.disputeReason,
                requestedRefundPaise: command.requestedRefundPaise,
            },
        });
        // Send Notification
        await this.notificationService.send({
            bookingId: booking.id ?? null,
            recipientId: command.actorId,
            channel: 'PUSH',
            recipient: `user_${command.actorId}`,
            templateId: 'DISPUTE_RAISED',
            title: 'Dispute Registered',
            body: `Dispute registered for booking #${booking.publicId}`,
            data: { bookingPublicId: booking.publicId },
        });
        return savedDispute;
    }
}
//# sourceMappingURL=RaiseDisputeUseCase.js.map