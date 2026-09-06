import { DomainError } from "@carbroz/foundation-kernel";
import { AuditLogService } from "@carbroz/domain-audit";
import { Dispute } from "../../domain/Dispute.js";
import { IDisputeRepository } from "../../domain/repositories/IDisputeRepository.js";
import { ErrorCode, Money } from "@carbroz/foundation-kernel";
import { IBookingRepository } from "@carbroz/domain-booking";
import { IPaymentRepository } from "@carbroz/domain-financials";
import { NotificationService } from "@carbroz/domain-communications";
/** ResolveDisputeCommand is an exported domains/dispute contract/implementation; see the owning README for lifecycle and extension rules. */
export interface ResolveDisputeCommand {
  disputePublicId: string;
  adminId: number;
  action: "REFUND" | "REJECT";
  approvedRefundPaise?: number;
  resolutionNotes: string;
}

/** ResolveDisputeUseCase is an exported domains/dispute contract/implementation; see the owning README for lifecycle and extension rules. */
export class ResolveDisputeUseCase {
  constructor(
    private readonly disputeRepository: IDisputeRepository,
    private readonly bookingRepository: IBookingRepository,
    private readonly paymentRepository: IPaymentRepository,
    private readonly notificationService: NotificationService,
    private readonly auditLogService: AuditLogService,
  ) {}

  /** Executes this application operation through its declared ports and domain invariants. */
  async execute(command: ResolveDisputeCommand): Promise<Dispute> {
    const dispute = await this.disputeRepository.findByPublicId(
      command.disputePublicId,
    );
    if (!dispute) {
      throw new DomainError(ErrorCode.RESOURCE_NOT_FOUND);
    }

    const booking = await this.bookingRepository.findById(dispute.bookingId);
    if (!booking) {
      throw new DomainError(ErrorCode.BOOKING_NOT_FOUND);
    }

    if (command.action === "REFUND") {
      const refundAmount = Money.fromMinor(
        command.approvedRefundPaise ??
          dispute.requestedRefundAmount.amountMinor,
      );
      dispute.resolveRefund(refundAmount, command.resolutionNotes);

      // Verify payment record exists
      const payment = await this.paymentRepository.findByBookingId(booking.id!);
      if (!payment) {
        throw new DomainError(ErrorCode.PAYMENT_FAILED);
      }
    } else {
      dispute.reject(command.resolutionNotes);
    }

    const updatedDispute = await this.disputeRepository.update(dispute);

    // Audit Logging
    await this.auditLogService.log({
      actorId: command.adminId,
      actorType: "ADMIN",
      action: command.action === "REFUND" ? "DISPUTE_REFUND" : "DISPUTE_REJECT",
      resource: "Dispute",
      resourcePublicId: dispute.publicId,
      newValue: {
        status: updatedDispute.status,
        refundedAmountPaise: updatedDispute.refundedAmount.amountMinor,
        notes: command.resolutionNotes,
      },
    });

    // Notify user who raised dispute
    await this.notificationService.send({
      bookingId: booking.id ?? null,
      recipientId: dispute.raisedByActorId,
      channel: "PUSH",
      recipient: `user_${dispute.raisedByActorId}`,
      templateId: "DISPUTE_RESOLVED",
      title: "Dispute Resolution Updated",
      body: `Dispute for booking #${booking.publicId} has been resolved (${updatedDispute.status})`,
      data: {
        disputePublicId: dispute.publicId,
        status: updatedDispute.status,
      },
    });

    return updatedDispute;
  }
}
