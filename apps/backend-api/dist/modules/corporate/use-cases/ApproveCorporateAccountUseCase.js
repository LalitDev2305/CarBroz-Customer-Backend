import { CorporateCreditLedger, Money, } from '@carbroz/common';
export class ApproveCorporateAccountUseCase {
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
        const limitMoney = Money.fromPaise(dto.initialCreditLimitPaise);
        account.approve(limitMoney);
        const updatedAccount = await this.corporateAccountRepo.update(account);
        // Record initial ledger entry
        const ledgerEntry = new CorporateCreditLedger({
            corporateAccountId: updatedAccount.id,
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
//# sourceMappingURL=ApproveCorporateAccountUseCase.js.map