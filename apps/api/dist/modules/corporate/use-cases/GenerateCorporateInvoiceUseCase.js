import { CorporateInvoice, TaxCalculator, Money, } from '@carbroz/foundation-kernel';
export class GenerateCorporateInvoiceUseCase {
    corporateAccountRepo;
    corporateInvoiceRepo;
    bookingRepository;
    notificationService;
    auditLogService;
    constructor(corporateAccountRepo, corporateInvoiceRepo, bookingRepository, notificationService, auditLogService) {
        this.corporateAccountRepo = corporateAccountRepo;
        this.corporateInvoiceRepo = corporateInvoiceRepo;
        this.bookingRepository = bookingRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }
    async execute(dto, adminUserId) {
        const account = await this.corporateAccountRepo.findByPublicId(dto.accountPublicId);
        if (!account) {
            throw new Error(`Corporate account not found with publicId: ${dto.accountPublicId}`);
        }
        const startDate = new Date(dto.billingPeriodStart);
        const endDate = new Date(dto.billingPeriodEnd);
        const dueDate = new Date(dto.dueDate);
        const allBookings = await this.bookingRepository.listByCorporateAccountId
            ? await this.bookingRepository.listByCorporateAccountId(account.id)
            : [];
        const periodBookings = allBookings.filter((b) => {
            const bDate = new Date(b.createdAt ?? b.slotStartTime);
            return bDate >= startDate && bDate <= endDate && b.status === 'COMPLETED';
        });
        let subtotalPaise = 0n;
        const lines = periodBookings.map((b) => {
            const bAmount = BigInt(b.totalPricePaise);
            subtotalPaise += bAmount;
            return {
                bookingId: b.id,
                description: `Booking #${b.publicId} - Car Service`,
                amountPaise: bAmount,
                taxRateBasis: 18.0,
            };
        });
        const subtotalMoney = Money.fromPaise(Number(subtotalPaise));
        const isInterstate = !account.gstin.startsWith('27');
        const taxCalculator = new TaxCalculator();
        const taxResult = taxCalculator.calculateInvoiceTax(subtotalMoney, isInterstate);
        const yearMonth = startDate.toISOString().slice(0, 7).replace('-', '');
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const invoiceNumber = `INV-CORP-${yearMonth}-${randomSuffix}`;
        const invoice = new CorporateInvoice({
            invoiceNumber,
            corporateAccountId: account.id,
            billingPeriodStart: startDate,
            billingPeriodEnd: endDate,
            subtotalPaise: taxResult.subtotal.amountPaise,
            cgstPaise: taxResult.cgst.amountPaise,
            sgstPaise: taxResult.sgst.amountPaise,
            igstPaise: taxResult.igst.amountPaise,
            totalAmountPaise: taxResult.totalPrice.amountPaise,
            dueDate,
            status: 'ISSUED',
            lines,
        });
        const savedInvoice = await this.corporateInvoiceRepo.create(invoice);
        await this.auditLogService.log({
            actorId: adminUserId,
            actorType: 'ADMIN',
            action: 'CORPORATE_INVOICE_GENERATE',
            resource: 'CorporateInvoice',
            resourcePublicId: savedInvoice.publicId,
            newValue: { invoiceNumber: savedInvoice.invoiceNumber, totalAmountPaise: Number(savedInvoice.totalAmountPaise) },
        });
        return savedInvoice;
    }
}
//# sourceMappingURL=GenerateCorporateInvoiceUseCase.js.map