import {
  AuditLogService,
  Dispute,
  ErrorCode,
  IBookingRepository,
  IDisputeRepository,
  IPaymentRepository,
  Money,
  NotificationService,
} from '@carbroz/common';

export interface ResolveDisputeCommand {
  disputePublicId: string;
  adminId: number;
  action: 'REFUND' | 'REJECT';
  approvedRefundPaise?: number;
  resolutionNotes: string;
}

export class ResolveDisputeUseCase {
  constructor(
    private readonly disputeRepository: IDisputeRepository,
    private readonly bookingRepository: IBookingRepository,
    private readonly paymentRepository: IPaymentRepository,
    private readonly notificationService: NotificationService,
    private readonly auditLogService: AuditLogService
  ) {}

  async execute(command: ResolveDisputeCommand): Promise<Dispute> {
    const dispute = await this.disputeRepository.findByPublicId(command.disputePublicId);
    if (!dispute) {
      throw new Error(ErrorCode.RESOURCE_NOT_FOUND);
    }

    const booking = await this.bookingRepository.findById(dispute.bookingId);
    if (!booking) {
      throw new Error(ErrorCode.BOOKING_NOT_FOUND);
    }

    if (command.action === 'REFUND') {
      const refundAmount = Money.fromPaise(command.approvedRefundPaise ?? dispute.requestedRefundAmount.amountPaise);
      dispute.resolveRefund(refundAmount, command.resolutionNotes);

      // Verify payment record exists
      const payment = await this.paymentRepository.findByBookingId(booking.id!);
      if (!payment) {
        throw new Error(ErrorCode.PAYMENT_FAILED);
      }
    } else {
      dispute.reject(command.resolutionNotes);
    }

    const updatedDispute = await this.disputeRepository.update(dispute);

    // Audit Logging
    await this.auditLogService.log({
      actorId: command.adminId,
      actorType: 'ADMIN',
      action: command.action === 'REFUND' ? 'DISPUTE_REFUND' : 'DISPUTE_REJECT',
      resource: 'Dispute',
      resourcePublicId: dispute.publicId,
      newValue: {
        status: updatedDispute.status,
        refundedAmountPaise: updatedDispute.refundedAmount.amountPaise,
        notes: command.resolutionNotes,
      },
    });

    // Notify user who raised dispute
    await this.notificationService.send({
      bookingId: booking.id ?? null,
      recipientId: dispute.raisedByActorId,
      channel: 'PUSH',
      recipient: `user_${dispute.raisedByActorId}`,
      templateId: 'DISPUTE_RESOLVED',
      title: 'Dispute Resolution Updated',
      body: `Dispute for booking #${booking.publicId} has been resolved (${updatedDispute.status})`,
      data: { disputePublicId: dispute.publicId, status: updatedDispute.status },
    });

    return updatedDispute;
  }
}
