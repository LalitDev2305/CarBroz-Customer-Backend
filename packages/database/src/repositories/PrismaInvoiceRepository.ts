import { PrismaClient } from '@prisma/client';
import { IInvoiceRepository, Invoice, InvoiceStatus } from '@carbroz/common';

export class PrismaInvoiceRepository implements IInvoiceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private mapToDomain(record: any): Invoice {
    return new Invoice({
      id: record.id,
      publicId: record.publicId,
      bookingId: record.bookingId,
      invoiceNumber: record.invoiceNumber,
      status: record.status as InvoiceStatus,
      amountPaise: record.amountPaise,
      currency: record.currency,
      documentJson: record.documentJson as any,
      issuedAt: record.issuedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  async create(invoice: Invoice): Promise<Invoice> {
    const record = await this.prisma.invoice.create({
      data: {
        bookingId: invoice.bookingId,
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        amountPaise: invoice.amountPaise,
        currency: invoice.currency,
        documentJson: invoice.documentJson as any,
        issuedAt: invoice.issuedAt,
      },
    });
    return this.mapToDomain(record);
  }

  async findById(id: number): Promise<Invoice | null> {
    const record = await this.prisma.invoice.findUnique({ where: { id } });
    return record ? this.mapToDomain(record) : null;
  }

  async findByPublicId(publicId: string): Promise<Invoice | null> {
    const record = await this.prisma.invoice.findUnique({ where: { publicId } });
    return record ? this.mapToDomain(record) : null;
  }

  async findByBookingId(bookingId: number): Promise<Invoice | null> {
    const record = await this.prisma.invoice.findUnique({ where: { bookingId } });
    return record ? this.mapToDomain(record) : null;
  }

  async findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null> {
    const record = await this.prisma.invoice.findUnique({ where: { invoiceNumber } });
    return record ? this.mapToDomain(record) : null;
  }

  async generateNextInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const sequenceRecord = await this.prisma.invoiceSequence.upsert({
      where: { year },
      update: { lastSeq: { increment: 1 } },
      create: { year, lastSeq: 1 },
    });
    const seq = sequenceRecord.lastSeq.toString().padStart(6, '0');
    return `INV-${year}-${seq}`;
  }
}
