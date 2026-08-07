import { ICorporateAccountRepository, ICorporateInvoiceRepository, IBookingRepository, NotificationService, AuditLogService } from '@carbroz/foundation-kernel';
import { GenerateCorporateInvoiceDto } from '../dtos/corporate.dto.js';
export declare class GenerateCorporateInvoiceUseCase {
    private readonly corporateAccountRepo;
    private readonly corporateInvoiceRepo;
    private readonly bookingRepository;
    private readonly notificationService;
    private readonly auditLogService;
    constructor(corporateAccountRepo: ICorporateAccountRepository, corporateInvoiceRepo: ICorporateInvoiceRepository, bookingRepository: IBookingRepository, notificationService: NotificationService, auditLogService: AuditLogService);
    execute(dto: GenerateCorporateInvoiceDto, adminUserId: number): Promise<any>;
}
