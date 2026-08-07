import { AuditLogService, Dispute, IBookingRepository, IDisputeRepository, IPaymentRepository, NotificationService } from '@carbroz/foundation-kernel';
export interface ResolveDisputeCommand {
    disputePublicId: string;
    adminId: number;
    action: 'REFUND' | 'REJECT';
    approvedRefundPaise?: number;
    resolutionNotes: string;
}
export declare class ResolveDisputeUseCase {
    private readonly disputeRepository;
    private readonly bookingRepository;
    private readonly paymentRepository;
    private readonly notificationService;
    private readonly auditLogService;
    constructor(disputeRepository: IDisputeRepository, bookingRepository: IBookingRepository, paymentRepository: IPaymentRepository, notificationService: NotificationService, auditLogService: AuditLogService);
    execute(command: ResolveDisputeCommand): Promise<Dispute>;
}
