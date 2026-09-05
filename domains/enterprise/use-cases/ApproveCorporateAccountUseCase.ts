import {
  ICorporateAccountRepository,
  ICorporateCreditLedgerRepository,
  CorporateCreditLedger,
  AuditLogService,
  Money,
} from '@carbroz/common';
import { ApproveCorporateAccountDto } from '../dtos/corporate.dto.js';

export class ApproveCorporateAccountUseCase {
  constructor(
    private readonly corporateAccountRepo: ICorporateAccountRepository,
    private readonly creditLedgerRepo: ICorporateCreditLedgerRepository,
    private readonly auditLogService: AuditLogService
  ) {}

  async execute(dto: ApproveCorporateAccountDto, adminUserId: number) {
    const account = await this.corporateAccountRepo.findByPublicId(dto.accountPublicId);
    if (!account) {
      throw new Error(`Corporate account not found with publicId: ${dto.accountPublicId}`);
    }

    const limitMoney = Money.fromMinor(dto.initialCreditLimitPaise);
    account.approve(limitMoney);
    const updatedAccount = await this.corporateAccountRepo.update(account);

    const ledgerEntry = new CorporateCreditLedger({
      corporateAccountId: updatedAccount.id!,
      entryType: 'CREDIT_GRANTED',
      amountPaise: dto.initialCreditLimitPaise,
      balanceAfterPaise: dto.initialCreditLimitPaise,
      referenceNotes: `Initial credit limit granted on approval by Admin ID ${adminUserId}`,
    });
    await this.creditLedgerRepo.create(ledgerEntry);

    await this.auditLogService.log({
      actorId: adminUserId,
      actorType: 'ADMIN',
      action: 'CORPORATE_ACCOUNT_APPROVE',
      resource: 'CorporateAccount',
      resourcePublicId: updatedAccount.publicId,
      oldValue: { status: 'PENDING_APPROVAL', creditLimitPaise: 0 },
      newValue: { status: 'ACTIVE', creditLimitPaise: dto.initialCreditLimitPaise },
    });

    return updatedAccount;
  }
}
