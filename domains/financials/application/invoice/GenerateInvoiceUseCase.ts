import { type IBookingRepository } from '@carbroz/domain-booking';
import { type IInvoiceRepository } from '../../invoice/domain/repositories/IInvoiceRepository.js';
import { Invoice, type InvoiceDocument } from '../../invoice/domain/Invoice.js';
import { TaxCalculator } from '../../domain/services/TaxCalculator.js';
import { DEFAULT_FINANCIAL_CONFIG } from '../../domain/config/FinancialConfiguration.js';
import { Money } from '@carbroz/foundation-kernel';

export class GenerateInvoiceUseCase {
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly bookingRepository: IBookingRepository,
    private readonly taxCalculator = new TaxCalculator()
  ) {}

  async execute(bookingId: number): Promise<Invoice> {
    const existing = await this.invoiceRepository.findByBookingId(bookingId);
    if (existing) {
      return existing; // Idempotent
    }

    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    const invoiceNumber = await this.invoiceRepository.generateNextInvoiceNumber();
    const snapshots = booking.snapshots;

    const subtotalMoney = Money.fromPaise(snapshots.pricing.subtotalPaise, 'INR');
    const taxResult = this.taxCalculator.calculateInvoiceTax(subtotalMoney);

    const documentJson: InvoiceDocument = {
      invoiceNumber,
      bookingPublicId: booking.publicId!,
      customerName: `Customer #${booking.customerId}`,
      customerAddress: `${snapshots.address.addressLine1}, ${snapshots.address.city}, ${snapshots.address.state} - ${snapshots.address.postalCode}`,
      sellerGstin: process.env.SELLER_GSTIN || DEFAULT_FINANCIAL_CONFIG.sellerGstin,
      serviceName: snapshots.service.name,
      basePricePaise: snapshots.pricing.basePricePaise,
      addonsTotalPaise: snapshots.pricing.addonsTotalPaise,
      subtotalPaise: subtotalMoney.amountPaise,
      cgstPaise: taxResult.cgst.amountPaise,
      sgstPaise: taxResult.sgst.amountPaise,
      igstPaise: taxResult.igst.amountPaise,
      totalTaxPaise: taxResult.totalTax.amountPaise,
      totalPricePaise: taxResult.totalPrice.amountPaise,
      currency: 'INR',
      issuedAt: new Date(),
    };

    const invoice = new Invoice({
      bookingId,
      invoiceNumber,
      amountPaise: taxResult.totalPrice.amountPaise,
      currency: 'INR',
      status: 'ISSUED',
      documentJson,
    });

    return await this.invoiceRepository.create(invoice);
  }
}
