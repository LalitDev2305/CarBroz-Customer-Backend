import { ICorporateAccountRepository } from '../domain/repositories/ICorporateAccountRepository.js';
import { ICorporateInvoiceRepository } from '../domain/repositories/ICorporateInvoiceRepository.js';
import { CorporateInvoice } from '../domain/CorporateInvoice.js';
import { IBookingRepository } from '@carbroz/domain-booking';
import { TaxCalculator } from '@carbroz/domain-financials';
import { NotificationService } from '@carbroz/domain-communications';
import { AuditLogService } from '@carbroz/domain-audit';
import { Money } from '@carbroz/foundation-kernel';
import { GenerateCorporateInvoiceDto } from '../dtos/corporate.dto.js';

/** GenerateCorporateInvoiceUseCase is an exported domains/enterprise contract/implementation; see the owning README for lifecycle and extension rules. */
export class GenerateCorporateInvoiceUseCase {
  constructor(
    private readonly corporateAccountRepo: ICorporateAccountRepository,
    private readonly corporateInvoiceRepo: ICorporateInvoiceRepository,
    private readonly bookingRepository: IBookingRepository,
    private readonly notificationService: NotificationService,
    private readonly auditLogService: AuditLogService
  ) {}

  /** Executes this application operation through its declared ports and domain invariants. */
  async execute(dto: GenerateCorporateInvoiceDto, adminUserId: number) {
    void this.notificationService;
    const account = await this.corporateAccountRepo.findByPublicId(dto.accountPublicId);
    if (!account) {
      throw new Error(`Corporate account not found with publicId: ${dto.accountPublicId}`);
    }

    const startDate = new Date(dto.billingPeriodStart);
    const endDate = new Date(dto.billingPeriodEnd);
    const dueDate = new Date(dto.dueDate);

    const allBookings = await (this.bookingRepository as any).listByCorporateAccountId
      ? await (this.bookingRepository as any).listByCorporateAccountId(account.id!)
      : [];

    const periodBookings = allBookings.filter((b: any) => {
      const bDate = new Date(b.createdAt ?? b.slotStartTime);
      return bDate >= startDate && bDate <= endDate && b.status === 'COMPLETED';
    });

    let subtotalPaise = 0n;
    const lines = periodBookings.map((b: any) => {
      const bAmount = BigInt(b.totalPricePaise);
      subtotalPaise += bAmount;
      return {
        bookingId: b.id!,
        description: `Booking #${b.publicId} - Car Service`,
        amountPaise: bAmount,
        taxRateBasis: 18.0,
      };
    });

    const subtotalMoney = Money.fromMinor(Number(subtotalPaise));
    const isInterstate = !account.gstin.startsWith('27');
    const taxCalculator = new TaxCalculator();
    const taxResult = taxCalculator.calculateInvoiceTax(subtotalMoney, isInterstate);

    const yearMonth = startDate.toISOString().slice(0, 7).replace('-', '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-CORP-${yearMonth}-${randomSuffix}`;

    const invoice = new CorporateInvoice({
      invoiceNumber,
      corporateAccountId: account.id!,
      billingPeriodStart: startDate,
      billingPeriodEnd: endDate,
      subtotalPaise: taxResult.subtotal.amountMinor,
      cgstPaise: taxResult.cgst.amountMinor,
      sgstPaise: taxResult.sgst.amountMinor,
      igstPaise: taxResult.igst.amountMinor,
      totalAmountPaise: taxResult.totalPrice.amountMinor,
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
