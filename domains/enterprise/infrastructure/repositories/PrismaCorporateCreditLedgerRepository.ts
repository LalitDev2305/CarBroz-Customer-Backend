import { PrismaClient } from '@prisma/client';
import { type ICorporateCreditLedgerRepository } from '../../domain/corporate/repositories/ICorporateCreditLedgerRepository.js';
import { CorporateCreditLedger, type CorporateLedgerEntryType } from '../../domain/corporate/CorporateCreditLedger.js';

export class PrismaCorporateCreditLedgerRepository implements ICorporateCreditLedgerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private mapToDomain(record: any): CorporateCreditLedger {
    return new CorporateCreditLedger({
      id: record.id,
      publicId: record.publicId,
      corporateAccountId: record.corporateAccountId,
      bookingId: record.bookingId,
      invoiceId: record.invoiceId,
      entryType: record.entryType as CorporateLedgerEntryType,
      amountPaise: record.amountPaise,
      balanceAfterPaise: record.balanceAfterPaise,
      referenceNotes: record.referenceNotes,
      createdAt: record.createdAt,
    });
  }

  async create(entry: CorporateCreditLedger): Promise<CorporateCreditLedger> {
    const record = await (this.prisma as any).corporateCreditLedger.create({
      data: {
        corporateAccountId: entry.corporateAccountId,
        bookingId: entry.bookingId,
        invoiceId: entry.invoiceId,
        entryType: entry.entryType,
        amountPaise: entry.amountPaise,
        balanceAfterPaise: entry.balanceAfterPaise,
        referenceNotes: entry.referenceNotes,
      },
    });
    return this.mapToDomain(record);
  }

  async findById(id: number): Promise<CorporateCreditLedger | null> {
    const record = await (this.prisma as any).corporateCreditLedger.findUnique({ where: { id } });
    return record ? this.mapToDomain(record) : null;
  }

  async findByPublicId(publicId: string): Promise<CorporateCreditLedger | null> {
    const record = await (this.prisma as any).corporateCreditLedger.findUnique({ where: { publicId } });
    return record ? this.mapToDomain(record) : null;
  }

  async listByAccountId(corporateAccountId: number, limit = 50, offset = 0): Promise<CorporateCreditLedger[]> {
    const records = await (this.prisma as any).corporateCreditLedger.findMany({
      where: { corporateAccountId },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r: any) => this.mapToDomain(r));
  }

  async getLatestEntry(corporateAccountId: number): Promise<CorporateCreditLedger | null> {
    const record = await (this.prisma as any).corporateCreditLedger.findFirst({
      where: { corporateAccountId },
      orderBy: { createdAt: 'desc' },
    });
    return record ? this.mapToDomain(record) : null;
  }
}
