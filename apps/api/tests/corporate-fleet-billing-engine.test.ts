import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  RegisterCorporateAccountUseCase,
  ApproveCorporateAccountUseCase,
  ValidateCorporateBookingUseCase,
  GenerateCorporateInvoiceUseCase,
  ReconcileCorporatePaymentUseCase,
} from '@carbroz/domain-enterprise';
import {
  CorporateAccount,
  CorporateMember,
  CorporateFleetVehicle,
  CorporateCreditLedger,
  CorporateInvoice,
  Money,
} from '@carbroz/common';

describe('Phase 22 — Corporate Accounts, Fleet Management & B2B Billing Use Case Suite', () => {
  let mockAccountRepo: any;
  let mockMemberRepo: any;
  let mockFleetVehicleRepo: any;
  let mockCreditLedgerRepo: any;
  let mockCorporateInvoiceRepo: any;
  let mockUserRepo: any;
  let mockVehicleRepo: any;
  let mockBookingRepo: any;
  let mockNotificationService: any;
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
      create: vi.fn(),
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

    mockUserRepo = {
      findById: vi.fn(),
      findByPublicId: vi.fn(),
      findByEmail: vi.fn(),
    };

    mockVehicleRepo = {
      findById: vi.fn(),
      findByPublicId: vi.fn(),
    };

    mockBookingRepo = {
      findById: vi.fn(),
      listByCorporateAccountId: vi.fn(),
    };

    mockNotificationService = {
      send: vi.fn(),
    };

    mockAuditLogService = {
      log: vi.fn(),
    };
  });

  it('should register corporate account and assign creator as CORP_ADMIN', async () => {
    mockAccountRepo.findByGstin.mockResolvedValue(null);
    mockAccountRepo.create.mockImplementation(async (acc: any) => {
      acc.id = 1;
      acc.publicId = 'corp-pub-1';
      return acc;
    });
    mockMemberRepo.create.mockResolvedValue({});

    const useCase = new RegisterCorporateAccountUseCase(
      mockAccountRepo,
      mockMemberRepo,
      mockUserRepo,
      mockAuditLogService
    );

    const result = await useCase.execute(
      {
        companyName: 'TechCorp India',
        legalName: 'TechCorp Pvt Ltd',
        gstin: '27AABCU9603R1ZM',
        pan: 'AABCU9603R',
        billingAddress: {
          addressLine1: 'BKC',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400051',
          country: 'India',
        },
      },
      101
    );

    expect(result.companyName).toBe('TechCorp India');
    expect(result.status).toBe('PENDING_APPROVAL');
    expect(mockMemberRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'CORP_ADMIN', userId: 101 })
    );
    expect(mockAuditLogService.log).toHaveBeenCalled();
  });

  it('should approve corporate account and assign initial credit limit with ledger entry', async () => {
    const pendingAccount = new CorporateAccount({
      id: 1,
      publicId: 'corp-pub-1',
      companyName: 'TechCorp India',
      legalName: 'TechCorp Pvt Ltd',
      gstin: '27AABCU9603R1ZM',
      pan: 'AABCU9603R',
      billingAddress: { addressLine1: 'BKC', city: 'Mumbai', state: 'Maharashtra', postalCode: '400051', country: 'India' },
      status: 'PENDING_APPROVAL',
    });

    mockAccountRepo.findByPublicId.mockResolvedValue(pendingAccount);
    mockAccountRepo.update.mockImplementation(async (acc: any) => acc);

    const useCase = new ApproveCorporateAccountUseCase(
      mockAccountRepo,
      mockCreditLedgerRepo,
      mockAuditLogService
    );

    const result = await useCase.execute(
      { accountPublicId: 'corp-pub-1', initialCreditLimitPaise: 5000000 },
      999
    );

    expect(result.status).toBe('ACTIVE');
    expect(result.creditLimitPaise).toBe(5000000n);
    expect(mockCreditLedgerRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ entryType: 'CREDIT_GRANTED', amountPaise: 5000000n })
    );
  });

  it('should validate corporate booking eligibility correctly', async () => {
    const activeAccount = new CorporateAccount({
      id: 1,
      publicId: 'corp-pub-1',
      companyName: 'TechCorp India',
      legalName: 'TechCorp Pvt Ltd',
      gstin: '27AABCU9603R1ZM',
      pan: 'AABCU9603R',
      billingAddress: { addressLine1: 'BKC', city: 'Mumbai', state: 'Maharashtra', postalCode: '400051', country: 'India' },
      status: 'ACTIVE',
      creditLimitPaise: 1000000,
      utilisedCreditPaise: 200000,
    });

    const activeMember = new CorporateMember({
      id: 1,
      corporateAccountId: 1,
      userId: 10,
      role: 'EMPLOYEE',
      status: 'ACTIVE',
    });

    const fleetVeh = new CorporateFleetVehicle({
      id: 5,
      corporateAccountId: 1,
      vehicleId: 20,
      status: 'ACTIVE',
    });

    mockUserRepo.findByPublicId.mockResolvedValue({ id: 10, publicId: 'usr-10' });
    mockMemberRepo.findByUserId.mockResolvedValue(activeMember);
    mockAccountRepo.findById.mockResolvedValue(activeAccount);
    mockVehicleRepo.findByPublicId.mockResolvedValue({ id: 20, publicId: 'veh-20' });
    mockFleetVehicleRepo.findByAccountAndVehicle.mockResolvedValue(fleetVeh);

    const useCase = new ValidateCorporateBookingUseCase(
      mockAccountRepo,
      mockMemberRepo,
      mockFleetVehicleRepo,
      mockCreditLedgerRepo,
      mockUserRepo,
      mockVehicleRepo
    );

    const result = await useCase.execute({
      userPublicId: 'usr-10',
      vehiclePublicId: 'veh-20',
      bookingAmountPaise: 300000,
    });

    expect(result.eligible).toBe(true);
    expect(result.corporateAccountId).toBe(1);
    expect(result.corporateFleetVehicleId).toBe(5);
  });

  it('should generate monthly corporate invoice and reconcile offline B2B payment', async () => {
    const activeAccount = new CorporateAccount({
      id: 1,
      publicId: 'corp-pub-1',
      companyName: 'TechCorp India',
      legalName: 'TechCorp Pvt Ltd',
      gstin: '27AABCU9603R1ZM',
      pan: 'AABCU9603R',
      billingAddress: { addressLine1: 'BKC', city: 'Mumbai', state: 'Maharashtra', postalCode: '400051', country: 'India' },
      status: 'ACTIVE',
    });

    mockAccountRepo.findByPublicId.mockResolvedValue(activeAccount);
    mockAccountRepo.findById.mockResolvedValue(activeAccount);
    mockBookingRepo.listByCorporateAccountId.mockResolvedValue([
      {
        id: 101,
        publicId: 'bk-101',
        status: 'COMPLETED',
        totalPricePaise: 100000,
        createdAt: new Date('2026-08-10'),
      },
    ]);
    mockCorporateInvoiceRepo.create.mockImplementation(async (inv: any) => {
      inv.id = 50;
      inv.publicId = 'inv-pub-50';
      return inv;
    });

    const genUseCase = new GenerateCorporateInvoiceUseCase(
      mockAccountRepo,
      mockCorporateInvoiceRepo,
      mockBookingRepo,
      mockNotificationService,
      mockAuditLogService
    );

    const invoice = await genUseCase.execute(
      {
        accountPublicId: 'corp-pub-1',
        billingPeriodStart: '2026-08-01',
        billingPeriodEnd: '2026-08-31',
        dueDate: '2026-09-15',
      },
      999
    );

    expect(invoice.status).toBe('ISSUED');
    expect(invoice.lines).toHaveLength(1);

    mockCorporateInvoiceRepo.findByPublicId.mockResolvedValue(invoice);
    mockCorporateInvoiceRepo.update.mockImplementation(async (inv: any) => inv);
    mockAccountRepo.updateUtilisedCredit.mockResolvedValue(activeAccount);

    const recUseCase = new ReconcileCorporatePaymentUseCase(
      mockAccountRepo,
      mockCorporateInvoiceRepo,
      mockCreditLedgerRepo,
      mockAuditLogService
    );

    const reconciled = await recUseCase.execute(
      {
        invoicePublicId: 'inv-pub-50',
        paymentAmountPaise: Number(invoice.totalAmountPaise),
        referenceNotes: 'NEFT Bank Transfer #12345',
      },
      999
    );

    expect(reconciled.status).toBe('PAID');
    expect(mockCreditLedgerRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ entryType: 'PAYMENT_CREDIT' })
    );
  });
});
