import type { ICorporateAccountRepository } from '../domain/repositories/ICorporateAccountRepository.js';
import type { ICorporateCreditAccountingPort } from '../application/ports/ICorporateCreditAccountingPort.js';
import { AuditLogService } from '@carbroz/domain-audit';
import { Money } from '@carbroz/foundation-kernel';
import { ApproveCorporateAccountDto } from '../dtos/corporate.dto.js';

/** Approves Enterprise account policy while delegating the accounting record to Financials. */
export class ApproveCorporateAccountUseCase {
  constructor(
    private readonly corporateAccountRepo: ICorporateAccountRepository,
    private readonly corporateCreditAccounting: ICorporateCreditAccountingPort,
    private readonly auditLogService: AuditLogService,
  ) {}

  async execute(dto: ApproveCorporateAccountDto, adminUserId: number) {
    const account = await this.corporateAccountRepo.findByPublicId(dto.accountPublicId);
    if (!account) {
      throw new Error(`Corporate account not found with publicId: ${dto.accountPublicId}`);
    }

    const limitMoney = Money.fromMinor(dto.initialCreditLimitPaise);
    account.approve(limitMoney);
    const updatedAccount = await this.corporateAccountRepo.update(account);

    await this.corporateCreditAccounting.recordCreditGrant({
      corporateAccountId: updatedAccount.id!,
      amountPaise: BigInt(dto.initialCreditLimitPaise),
      balanceAfterPaise: updatedAccount.creditLimitPaise - updatedAccount.utilisedCreditPaise,
      referenceNotes: `Initial credit limit granted on approval by Admin ID ${adminUserId}`,
    });

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
