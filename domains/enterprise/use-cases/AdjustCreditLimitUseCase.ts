import {
  ICorporateAccountRepository,
  ICorporateCreditLedgerRepository,
  CorporateCreditLedger,
  AuditLogService,
  Money,
} from '@carbroz/common';
import { AdjustCreditLimitDto } from '../dtos/corporate.dto.js';

export class AdjustCreditLimitUseCase {
  constructor(
    private readonly corporateAccountRepo: ICorporateAccountRepository,
    private readonly creditLedgerRepo: ICorporateCreditLedgerRepository,
    private readonly auditLogService: AuditLogService
  ) {}

  async execute(dto: AdjustCreditLimitDto, adminUserId: number) {
    const account = await this.corporateAccountRepo.findByPublicId(dto.accountPublicId);
    if (!account) {
      throw new Error(`Corporate account not found with publicId: ${dto.accountPublicId}`);
    }

    const oldLimit = account.creditLimitPaise;
    const newLimitMoney = Money.fromMinor(dto.newCreditLimitPaise);
    account.adjustCreditLimit(newLimitMoney);
    const updatedAccount = await this.corporateAccountRepo.update(account);

    const deltaPaise = BigInt(dto.newCreditLimitPaise) - oldLimit;

    const ledgerEntry = new CorporateCreditLedger({
      corporateAccountId: updatedAccount.id!,
      entryType: 'ADJUSTMENT',
      amountPaise: deltaPaise,
      balanceAfterPaise: dto.newCreditLimitPaise,
      referenceNotes: dto.reason ?? `Credit limit adjusted by Admin ID ${adminUserId}`,
    });
    await this.creditLedgerRepo.create(ledgerEntry);

    await this.auditLogService.log({
      actorId: adminUserId,
      actorType: 'ADMIN',
      action: 'CORPORATE_CREDIT_ADJUST',
      resource: 'CorporateAccount',
      resourcePublicId: updatedAccount.publicId,
      oldValue: { creditLimitPaise: Number(oldLimit) },
      newValue: { creditLimitPaise: dto.newCreditLimitPaise },
    });

    return updatedAccount;
  }
}
