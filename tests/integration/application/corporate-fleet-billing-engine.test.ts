import {
  CorporateAccount,
  CorporateMember,
  CorporateFleetVehicle,
  RegisterCorporateAccountUseCase,
  ApproveCorporateAccountUseCase,
  ValidateCorporateBookingUseCase,
} from '@carbroz/domain-enterprise';
import {
  CorporateCreditAccountingService,
  CorporateCreditLedger,
  CorporateInvoice,
  GenerateCorporateInvoiceUseCase,
  ReconcileCorporatePaymentUseCase,
} from '@carbroz/domain-financials';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Corporate account, fleet eligibility and Financials B2B accounting', () => {
  let mockAccountRepo: any;
  let mockMemberRepo: any;
  let mockFleetVehicleRepo: any;
  let mockCreditLedgerRepo: any;
  let mockCorporateInvoiceRepo: any;
  let mockUserRepo: any;
  let mockVehicleRepo: any;
  let mockBookingRepo: any;
  let mockAuditLogService: any;

  beforeEach(() => {
    mockAccountRepo = {
      create: vi.fn(),
      update: vi.fn(),
      findById: vi.fn(),
      findByPublicId: vi.fn(),
      findByGstin: vi.fn(),
      listByStatus: vi.fn(),
      updateUtilisedCredit: vi.fn(),
    };
    mockMemberRepo = {
      create: vi.fn(),
      update: vi.fn(),
      findById: vi.fn(),
      findByPublicId: vi.fn(),
      findByAccountAndUser: vi.fn(),
      findByUserId: vi.fn(),
      listByAccountId: vi.fn(),
      delete: vi.fn(),
    };
    mockFleetVehicleRepo = {
      create: vi.fn(),
      update: vi.fn(),
      findById: vi.fn(),
      findByPublicId: vi.fn(),
      findByAccountAndVehicle: vi.fn(),
      findByVehicleId: vi.fn(),
      listByAccountId: vi.fn(),
      delete: vi.fn(),
    };
    mockCreditLedgerRepo = {
      create: vi.fn(async (entry: any) => entry),
      findById: vi.fn(),
      findByPublicId: vi.fn(),
      listByAccountId: vi.fn(),
      getLatestEntry: vi.fn(),
    };
    mockCorporateInvoiceRepo = {
      create: vi.fn(),
      update: vi.fn(),
      findById: vi.fn(),
      findByPublicId: vi.fn(),
      findByInvoiceNumber: vi.fn(),
      listByAccountId: vi.fn(),
    };
    mockUserRepo = { findById: vi.fn(), findByPublicId: vi.fn(), findByEmail: vi.fn() };
    mockVehicleRepo = { findById: vi.fn(), findByPublicId: vi.fn() };
    mockBookingRepo = { findById: vi.fn(), listByCorporateAccountId: vi.fn() };
    mockAuditLogService = { log: vi.fn(async () => undefined) };
  });

  it('registers the corporate account and assigns the creator as CORP_ADMIN', async () => {
    mockAccountRepo.findByGstin.mockResolvedValue(null);
    mockAccountRepo.create.mockImplementation(async (account: any) => {
      account.id = 1;
      account.publicId = 'corp-pub-1';
      return account;
    });
    mockMemberRepo.create.mockResolvedValue({});

    const useCase = new RegisterCorporateAccountUseCase(
      mockAccountRepo,
      mockMemberRepo,
      mockUserRepo,
      mockAuditLogService,
    );
    const result = await useCase.execute({
      companyName: 'TechCorp India',
      legalName: 'TechCorp Pvt Ltd',
      gstin: '27AABCU9603R1ZM',
      pan: 'AABCU9603R',
      billingAddress: {
        addressLine1: 'BKC', city: 'Mumbai', state: 'Maharashtra', postalCode: '400051', country: 'India',
      },
    }, 101);

    expect(result.companyName).toBe('TechCorp India');
    expect(result.status).toBe('PENDING_APPROVAL');
    expect(mockMemberRepo.create).toHaveBeenCalledWith(expect.objectContaining({ role: 'CORP_ADMIN', userId: 101 }));
    expect(mockAuditLogService.log).toHaveBeenCalled();
  });

  it('keeps account approval in Enterprise while Financials records the credit grant', async () => {
    const pendingAccount = new CorporateAccount({
      id: 1,
      publicId: 'corp-pub-1',
      companyName: 'TechCorp India',
      legalName: 'TechCorp Pvt Ltd',
      gstin: '27AABCU9603R1ZM',
      pan: 'AABCU9603R',
      billingAddress: {
        addressLine1: 'BKC', city: 'Mumbai', state: 'Maharashtra', postalCode: '400051', country: 'India',
      },
      status: 'PENDING_APPROVAL',
    });
    mockAccountRepo.findByPublicId.mockResolvedValue(pendingAccount);
    mockAccountRepo.update.mockImplementation(async (account: any) => account);
    const accounting = new CorporateCreditAccountingService(mockAccountRepo, mockCreditLedgerRepo);

    const result = await new ApproveCorporateAccountUseCase(
      mockAccountRepo,
      accounting,
      mockAuditLogService,
    ).execute({ accountPublicId: 'corp-pub-1', initialCreditLimitPaise: 5_000_000 }, 999);

    expect(result.status).toBe('ACTIVE');
    expect(result.creditLimitPaise).toBe(5_000_000n);
    expect(mockCreditLedgerRepo.create).toHaveBeenCalledWith(expect.objectContaining({
      entryType: 'CREDIT_GRANTED', amountPaise: 5_000_000n,
    }));
  });

  it('validates corporate booking eligibility without writing financial state', async () => {
    const activeAccount = new CorporateAccount({
      id: 1,
      publicId: 'corp-pub-1',
      companyName: 'TechCorp India',
      legalName: 'TechCorp Pvt Ltd',
      gstin: '27AABCU9603R1ZM',
      pan: 'AABCU9603R',
      billingAddress: {
        addressLine1: 'BKC', city: 'Mumbai', state: 'Maharashtra', postalCode: '400051', country: 'India',
      },
      status: 'ACTIVE',
      creditLimitPaise: 1_000_000,
      utilisedCreditPaise: 200_000,
    });
    const activeMember = new CorporateMember({
      id: 1, corporateAccountId: 1, userId: 10, role: 'EMPLOYEE', status: 'ACTIVE',
    });
    const fleetVehicle = new CorporateFleetVehicle({
      id: 5, corporateAccountId: 1, vehicleId: 20, status: 'ACTIVE',
    });
    mockUserRepo.findByPublicId.mockResolvedValue({ id: 10, publicId: 'usr-10' });
    mockMemberRepo.findByUserId.mockResolvedValue(activeMember);
    mockAccountRepo.findById.mockResolvedValue(activeAccount);
    mockVehicleRepo.findByPublicId.mockResolvedValue({ id: 20, publicId: 'veh-20' });
    mockFleetVehicleRepo.findByAccountAndVehicle.mockResolvedValue(fleetVehicle);

    const result = await new ValidateCorporateBookingUseCase(
      mockAccountRepo,
      mockMemberRepo,
      mockFleetVehicleRepo,
      mockUserRepo,
      mockVehicleRepo,
    ).execute({ userPublicId: 'usr-10', vehiclePublicId: 'veh-20', bookingAmountPaise: 300_000 });

    expect(result).toEqual({ eligible: true, corporateAccountId: 1, corporateFleetVehicleId: 5 });
    expect(mockCreditLedgerRepo.create).not.toHaveBeenCalled();
  });

  it('generates the corporate invoice in Financials and reconciles payment through Financials accounting', async () => {
    const activeAccount = new CorporateAccount({
      id: 1,
      publicId: 'corp-pub-1',
      companyName: 'TechCorp India',
      legalName: 'TechCorp Pvt Ltd',
      gstin: '27AABCU9603R1ZM',
      pan: 'AABCU9603R',
      billingAddress: {
        addressLine1: 'BKC', city: 'Mumbai', state: 'Maharashtra', postalCode: '400051', country: 'India',
      },
      status: 'ACTIVE',
      creditLimitPaise: 1_000_000,
      utilisedCreditPaise: 118_000,
    });
    mockAccountRepo.findByPublicId.mockResolvedValue(activeAccount);
    mockAccountRepo.findById.mockResolvedValue(activeAccount);
    mockBookingRepo.listByCorporateAccountId.mockResolvedValue([{
      id: 101,
      publicId: 'bk-101',
      status: 'COMPLETED',
      totalPricePaise: 100_000,
      createdAt: new Date('2026-08-10T00:00:00.000Z'),
      slotStartTime: new Date('2026-08-10T00:00:00.000Z'),
    }]);
    mockCorporateInvoiceRepo.create.mockImplementation(async (invoice: CorporateInvoice) => {
      invoice.id = 50;
      invoice.publicId = 'inv-pub-50';
      return invoice;
    });

    const invoice = await new GenerateCorporateInvoiceUseCase(
      mockAccountRepo,
      mockCorporateInvoiceRepo,
      mockBookingRepo,
      mockAuditLogService,
    ).execute({
      accountPublicId: 'corp-pub-1',
      billingPeriodStart: '2026-08-01',
      billingPeriodEnd: '2026-08-31',
      dueDate: '2026-09-15',
    }, 999);

    expect(invoice.status).toBe('ISSUED');
    expect(invoice.lines).toHaveLength(1);
    expect(invoice.totalAmountPaise).toBe(118_000n);

    mockCorporateInvoiceRepo.findByPublicId.mockResolvedValue(invoice);
    mockCorporateInvoiceRepo.update.mockImplementation(async (saved: CorporateInvoice) => saved);
    mockAccountRepo.updateUtilisedCredit.mockImplementation(async (_id: number, delta: bigint) => new CorporateAccount({
      id: 1,
      publicId: 'corp-pub-1',
      companyName: 'TechCorp India', legalName: 'TechCorp Pvt Ltd', gstin: '27AABCU9603R1ZM', pan: 'AABCU9603R',
      billingAddress: { addressLine1: 'BKC', city: 'Mumbai', state: 'Maharashtra', postalCode: '400051', country: 'India' },
      status: 'ACTIVE', creditLimitPaise: 1_000_000n, utilisedCreditPaise: 118_000n + delta,
    }));
    const accounting = new CorporateCreditAccountingService(mockAccountRepo, mockCreditLedgerRepo);

    const reconciled = await new ReconcileCorporatePaymentUseCase(
      mockCorporateInvoiceRepo,
      accounting,
      mockAuditLogService,
    ).execute({
      invoicePublicId: 'inv-pub-50',
      paymentAmountPaise: Number(invoice.totalAmountPaise),
      referenceNotes: 'NEFT Bank Transfer #12345',
    }, 999);

    expect(reconciled.status).toBe('PAID');
    expect(mockCreditLedgerRepo.create).toHaveBeenCalledWith(expect.objectContaining({
      entryType: 'PAYMENT_CREDIT', invoiceId: 50, amountPaise: 118_000n,
    }));
  });

  it('exposes corporate invoices and corporate credit ledger from Financials', () => {
    expect(CorporateInvoice).toBeDefined();
    expect(CorporateCreditLedger).toBeDefined();
  });
});
