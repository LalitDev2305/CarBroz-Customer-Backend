import { AuditLogService, Dispute, DisputeReason, IBookingRepository, IDisputeRepository, NotificationService } from '@carbroz/common';
export interface RaiseDisputeCommand {
    bookingPublicId: string;
    actorId: number;
    actorType: 'CUSTOMER' | 'PARTNER';
    disputeReason: DisputeReason | string;
    description?: string;
    requestedRefundPaise: number;
}
export declare class RaiseDisputeUseCase {
    private readonly disputeRepository;
    private readonly bookingRepository;
    private readonly notificationService;
    private readonly auditLogService;
    constructor(disputeRepository: IDisputeRepository, bookingRepository: IBookingRepository, notificationService: NotificationService, auditLogService: AuditLogService);
    execute(command: RaiseDisputeCommand): Promise<Dispute>;
}
