import type { ICorporateAccountRepository } from '../domain/repositories/ICorporateAccountRepository.js';
import type { ICorporateCreditAccountingPort } from '../application/ports/ICorporateCreditAccountingPort.js';
import { AuditLogService } from '@carbroz/domain-audit';
import { Money } from '@carbroz/foundation-kernel';
import { AdjustCreditLimitDto } from '../dtos/corporate.dto.js';

/** Adjusts Enterprise credit policy while delegating the accounting record to Financials. */
export class AdjustCreditLimitUseCase {
  constructor(
    private readonly corporateAccountRepo: ICorporateAccountRepository,
    private readonly corporateCreditAccounting: ICorporateCreditAccountingPort,
    private readonly auditLogService: AuditLogService,
  ) {}

  async execute(dto: AdjustCreditLimitDto, adminUserId: number) {
    const account = await this.corporateAccountRepo.findByPublicId(dto.accountPublicId);
    if (!account) {
      throw new Error(`Corporate account not found with publicId: ${dto.accountPublicId}`);
    }

    const oldLimit = account.creditLimitPaise;
    account.adjustCreditLimit(Money.fromMinor(dto.newCreditLimitPaise));
    const updatedAccount = await this.corporateAccountRepo.update(account);
    const deltaPaise = BigInt(dto.newCreditLimitPaise) - oldLimit;

    await this.corporateCreditAccounting.recordCreditAdjustment({
      corporateAccountId: updatedAccount.id!,
      amountPaise: deltaPaise,
      balanceAfterPaise: updatedAccount.creditLimitPaise - updatedAccount.utilisedCreditPaise,
      referenceNotes: dto.reason ?? `Credit limit adjusted by Admin ID ${adminUserId}`,
    });

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
