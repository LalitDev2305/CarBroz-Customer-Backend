import { CorporateCreditLedger, Money, } from '@carbroz/foundation-kernel';
export class AdjustCreditLimitUseCase {
    corporateAccountRepo;
    creditLedgerRepo;
    auditLogService;
    constructor(corporateAccountRepo, creditLedgerRepo, auditLogService) {
        this.corporateAccountRepo = corporateAccountRepo;
        this.creditLedgerRepo = creditLedgerRepo;
        this.auditLogService = auditLogService;
    }
    async execute(dto, adminUserId) {
        const account = await this.corporateAccountRepo.findByPublicId(dto.accountPublicId);
        if (!account) {
            throw new Error(`Corporate account not found with publicId: ${dto.accountPublicId}`);
        }
        const oldLimit = account.creditLimitPaise;
        const newLimitMoney = Money.fromPaise(dto.newCreditLimitPaise);
        account.adjustCreditLimit(newLimitMoney);
        const updatedAccount = await this.corporateAccountRepo.update(account);
        const deltaPaise = BigInt(dto.newCreditLimitPaise) - oldLimit;
        // Record adjustment in ledger
        const ledgerEntry = new CorporateCreditLedger({
            corporateAccountId: updatedAccount.id,
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
//# sourceMappingURL=AdjustCreditLimitUseCase.js.map