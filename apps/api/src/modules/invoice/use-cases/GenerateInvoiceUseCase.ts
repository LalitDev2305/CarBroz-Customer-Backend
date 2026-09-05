import {
  IBookingRepository,
  IInvoiceRepository,
  Invoice,
  InvoiceDocument,
  Money,
  TaxCalculator,
  DEFAULT_FINANCIAL_CONFIG,
} from '@carbroz/common';

export class GenerateInvoiceUseCase {
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly bookingRepository: IBookingRepository,
    private readonly taxCalculator = new TaxCalculator()
  ) {}

  async execute(bookingId: number): Promise<Invoice> {
    const existing = await this.invoiceRepository.findByBookingId(bookingId);
    if (existing) {
      return existing;
    }

    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    const invoiceNumber = await this.invoiceRepository.generateNextInvoiceNumber();
    const snapshots = booking.snapshots;
    const subtotalMoney = Money.fromMinor(snapshots.pricing.subtotalPaise, 'INR');
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
      subtotalPaise: subtotalMoney.amountMinor,
      cgstPaise: taxResult.cgst.amountMinor,
      sgstPaise: taxResult.sgst.amountMinor,
      igstPaise: taxResult.igst.amountMinor,
      totalTaxPaise: taxResult.totalTax.amountMinor,
      totalPricePaise: taxResult.totalPrice.amountMinor,
      currency: 'INR',
      issuedAt: new Date(),
    };

    const invoice = new Invoice({
      bookingId,
      invoiceNumber,
      amountPaise: taxResult.totalPrice.amountMinor,
      currency: 'INR',
      status: 'ISSUED',
      documentJson,
    });

    return await this.invoiceRepository.create(invoice);
  }
}
