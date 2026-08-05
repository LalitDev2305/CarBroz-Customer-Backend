import { PrismaClient } from '@prisma/client';
import { ICorporateAccountRepository, CorporateAccount, CorporateAccountStatus } from '@carbroz/common';

export class PrismaCorporateAccountRepository implements ICorporateAccountRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private mapToDomain(record: any): CorporateAccount {
    return new CorporateAccount({
      id: record.id,
      publicId: record.publicId,
      companyName: record.companyName,
      legalName: record.legalName,
      gstin: record.gstin,
      pan: record.pan,
      billingAddress: record.billingAddress as any,
      creditLimitPaise: record.creditLimitPaise,
      utilisedCreditPaise: record.utilisedCreditPaise,
      status: record.status as CorporateAccountStatus,
      paymentTermsDays: record.paymentTermsDays,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  async create(account: CorporateAccount): Promise<CorporateAccount> {
    const record = await (this.prisma as any).corporateAccount.create({
      data: {
        companyName: account.companyName,
        legalName: account.legalName,
        gstin: account.gstin,
        pan: account.pan,
        billingAddress: account.billingAddress as any,
        creditLimitPaise: account.creditLimitPaise,
        utilisedCreditPaise: account.utilisedCreditPaise,
        status: account.status,
        paymentTermsDays: account.paymentTermsDays,
      },
    });
    return this.mapToDomain(record);
  }

  async update(account: CorporateAccount): Promise<CorporateAccount> {
    const record = await (this.prisma as any).corporateAccount.update({
      where: { id: account.id },
      data: {
        companyName: account.companyName,
        legalName: account.legalName,
        gstin: account.gstin,
        pan: account.pan,
        billingAddress: account.billingAddress as any,
        creditLimitPaise: account.creditLimitPaise,
        utilisedCreditPaise: account.utilisedCreditPaise,
        status: account.status,
        paymentTermsDays: account.paymentTermsDays,
      },
    });
    return this.mapToDomain(record);
  }

  async findById(id: number): Promise<CorporateAccount | null> {
    const record = await (this.prisma as any).corporateAccount.findUnique({ where: { id } });
    return record ? this.mapToDomain(record) : null;
  }

  async findByPublicId(publicId: string): Promise<CorporateAccount | null> {
    const record = await (this.prisma as any).corporateAccount.findUnique({ where: { publicId } });
    return record ? this.mapToDomain(record) : null;
  }

  async findByGstin(gstin: string): Promise<CorporateAccount | null> {
    const record = await (this.prisma as any).corporateAccount.findUnique({
      where: { gstin: gstin.trim().toUpperCase() },
    });
    return record ? this.mapToDomain(record) : null;
  }

  async listByStatus(status?: CorporateAccountStatus, limit = 50, offset = 0): Promise<CorporateAccount[]> {
    const records = await (this.prisma as any).corporateAccount.findMany({
      where: status ? { status } : undefined,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r: any) => this.mapToDomain(r));
  }

  async updateUtilisedCredit(id: number, deltaPaise: bigint): Promise<CorporateAccount> {
    const record = await (this.prisma as any).corporateAccount.update({
      where: { id },
      data: {
        utilisedCreditPaise: { increment: deltaPaise },
      },
    });
    return this.mapToDomain(record);
  }
}
