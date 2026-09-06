import { describe, expect, it, vi } from 'vitest';
import { CorporateCreditLedger } from '../../domain/CorporateCreditLedger.js';
import { PrismaCorporateCreditLedgerRepository } from './PrismaCorporateCreditLedgerRepository.js';

const record = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  publicId: 'ledger-1',
  corporateAccountId: 10,
  bookingId: 501,
  invoiceId: null,
  entryType: 'BOOKING_DEBIT',
  amountPaise: 10_000n,
  balanceAfterPaise: 90_000n,
  referenceNotes: 'booking debit',
  createdAt: new Date('2026-09-06T00:00:00.000Z'),
  ...overrides,
});

function fixture() {
  const corporateCreditLedger = {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
  };
  const prisma = { corporateCreditLedger } as any;
  return { repository: new PrismaCorporateCreditLedgerRepository(prisma), corporateCreditLedger };
}

describe('PrismaCorporateCreditLedgerRepository', () => {
  it('creates and maps a ledger entry', async () => {
    const { repository, corporateCreditLedger } = fixture();
    corporateCreditLedger.create.mockResolvedValue(record());
    const entity = new CorporateCreditLedger({
      corporateAccountId: 10,
      bookingId: 501,
      entryType: 'BOOKING_DEBIT',
      amountPaise: 10_000n,
      balanceAfterPaise: 90_000n,
      referenceNotes: 'booking debit',
    });

    await expect(repository.create(entity)).resolves.toMatchObject({
      id: 1,
      publicId: 'ledger-1',
      bookingId: 501,
      invoiceId: null,
    });
    expect(corporateCreditLedger.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ corporateAccountId: 10, entryType: 'BOOKING_DEBIT', amountPaise: 10_000n }),
    });
  });

  it('finds by internal and public id and returns null when absent', async () => {
    const { repository, corporateCreditLedger } = fixture();
    corporateCreditLedger.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(record())
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(record({ invoiceId: 700, bookingId: null, entryType: 'PAYMENT_CREDIT' }));

    await expect(repository.findById(999)).resolves.toBeNull();
    await expect(repository.findById(1)).resolves.toMatchObject({ id: 1 });
    await expect(repository.findByPublicId('missing')).resolves.toBeNull();
    await expect(repository.findByPublicId('ledger-1')).resolves.toMatchObject({ invoiceId: 700, bookingId: null });
  });

  it('lists account history in persistence order', async () => {
    const { repository, corporateCreditLedger } = fixture();
    corporateCreditLedger.findMany.mockResolvedValue([record(), record({ id: 2, publicId: 'ledger-2' })]);

    await expect(repository.listByAccountId(10, 25, 5)).resolves.toHaveLength(2);
    expect(corporateCreditLedger.findMany).toHaveBeenCalledWith({
      where: { corporateAccountId: 10 },
      take: 25,
      skip: 5,
      orderBy: { createdAt: 'desc' },
    });
  });

  it('uses default pagination and resolves latest entry including the empty case', async () => {
    const { repository, corporateCreditLedger } = fixture();
    corporateCreditLedger.findMany.mockResolvedValue([]);
    corporateCreditLedger.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(record());

    await expect(repository.listByAccountId(10)).resolves.toEqual([]);
    expect(corporateCreditLedger.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 50, skip: 0 }));
    await expect(repository.getLatestEntry(10)).resolves.toBeNull();
    await expect(repository.getLatestEntry(10)).resolves.toMatchObject({ publicId: 'ledger-1' });
  });
});
