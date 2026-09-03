import { type ICorporateAccountRepository } from '../domain/corporate/repositories/ICorporateAccountRepository.js';
import { type ICorporateInvoiceRepository } from '../domain/corporate/repositories/ICorporateInvoiceRepository.js';
import { CorporateInvoice } from '../domain/corporate/CorporateInvoice.js';
import { type IBookingRepository } from '@carbroz/domain-booking';
import { TaxCalculator } from '@carbroz/domain-financials';
import { Money } from '@carbroz/foundation-kernel';
import { NotificationService } from '@carbroz/domain-communications';
import { AuditLogService } from '@carbroz/domain-audit';
import { type GenerateCorporateInvoiceDto } from './contracts/corporate.contracts.js';

export class GenerateCorporateInvoiceUseCase {
  constructor(
    private readonly corporateAccountRepo: ICorporateAccountRepository,
    private readonly corporateInvoiceRepo: ICorporateInvoiceRepository,
    private readonly bookingRepository: IBookingRepository,
    private readonly notificationService: NotificationService,
    private readonly auditLogService: AuditLogService
  ) {}

  async execute(dto: GenerateCorporateInvoiceDto, adminUserId: number) {
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

    const subtotalMoney = Money.fromPaise(Number(subtotalPaise));
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
