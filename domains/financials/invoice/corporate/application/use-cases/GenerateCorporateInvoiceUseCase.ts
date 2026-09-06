import type { IBookingRepository } from '@carbroz/domain-booking';
import { Money } from '@carbroz/foundation-kernel';
import { TaxCalculator } from '../../../../domain/TaxCalculator.js';
import { CorporateInvoice } from '../../domain/CorporateInvoice.js';
import type { ICorporateInvoiceRepository } from '../../domain/repositories/ICorporateInvoiceRepository.js';
import type { GenerateCorporateInvoiceDto } from '../dto/corporate-invoice.dto.js';
import type { CorporateAccountBillingPort, FinancialAuditLogPort } from '../ports/CorporateBillingPorts.js';

/** Generates Financials-owned B2B invoices from completed corporate bookings. */
export class GenerateCorporateInvoiceUseCase {
  constructor(
    private readonly corporateAccountRepo: CorporateAccountBillingPort,
    private readonly corporateInvoiceRepo: ICorporateInvoiceRepository,
    private readonly bookingRepository: IBookingRepository,
    private readonly auditLogService: FinancialAuditLogPort
  ) {}

  async execute(dto: GenerateCorporateInvoiceDto, adminUserId: number) {
    const account = await this.corporateAccountRepo.findByPublicId(dto.accountPublicId);
    if (!account) {
      throw new Error(`Corporate account not found with publicId: ${dto.accountPublicId}`);
    }

    const startDate = new Date(dto.billingPeriodStart);
    const endDate = new Date(dto.billingPeriodEnd);
    const dueDate = new Date(dto.dueDate);

    const allBookings = await this.bookingRepository.listByCorporateAccountId(account.id!);
    const periodBookings = allBookings.filter((booking) => {
      const bookingDate = new Date(booking.createdAt ?? booking.slotStartTime);
      return bookingDate >= startDate && bookingDate <= endDate && booking.status === 'COMPLETED';
    });

    let subtotalPaise = 0n;
    const lines = periodBookings.map((booking) => {
      const bookingAmount = BigInt(booking.totalPricePaise);
      subtotalPaise += bookingAmount;
      return {
        bookingId: booking.id!,
        description: `Booking #${booking.publicId} - Car Service`,
        amountPaise: bookingAmount,
        taxRateBasis: 18.0,
      };
    });

    const subtotalMoney = Money.fromMinor(Number(subtotalPaise));
    const isInterstate = !account.gstin.startsWith('27');
    const taxResult = new TaxCalculator().calculateInvoiceTax(subtotalMoney, isInterstate);

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
      newValue: {
        invoiceNumber: savedInvoice.invoiceNumber,
        totalAmountPaise: Number(savedInvoice.totalAmountPaise),
      },
    });

    return savedInvoice;
  }
}
