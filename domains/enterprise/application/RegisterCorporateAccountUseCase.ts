import { type ICorporateAccountRepository } from '../domain/corporate/repositories/ICorporateAccountRepository.js';
import { type ICorporateMemberRepository } from '../domain/corporate/repositories/ICorporateMemberRepository.js';
import { CorporateAccount } from '../domain/corporate/CorporateAccount.js';
import { CorporateMember } from '../domain/corporate/CorporateMember.js';
import { type IUserRepository } from '@carbroz/domain-identity';
import { AuditLogService } from '@carbroz/domain-audit';
import { type RegisterCorporateAccountDto } from './contracts/corporate.contracts.js';

export class RegisterCorporateAccountUseCase {
  constructor(
    private readonly corporateAccountRepo: ICorporateAccountRepository,
    private readonly corporateMemberRepo: ICorporateMemberRepository,
    private readonly userRepository: IUserRepository,
    private readonly auditLogService: AuditLogService
  ) {}

  async execute(dto: RegisterCorporateAccountDto, actorUserId: number): Promise<CorporateAccount> {
    const existingGstin = await this.corporateAccountRepo.findByGstin(dto.gstin);
    if (existingGstin) {
      throw new Error(`Corporate account with GSTIN ${dto.gstin} already exists`);
    }

    const account = new CorporateAccount({
      companyName: dto.companyName,
      legalName: dto.legalName,
      gstin: dto.gstin,
      pan: dto.pan,
      billingAddress: dto.billingAddress,
      paymentTermsDays: dto.paymentTermsDays ?? 30,
      status: 'PENDING_APPROVAL',
      creditLimitPaise: 0n,
      utilisedCreditPaise: 0n,
    });

    const savedAccount = await this.corporateAccountRepo.create(account);

    const member = new CorporateMember({
      corporateAccountId: savedAccount.id!,
      userId: actorUserId,
      role: 'CORP_ADMIN',
      status: 'ACTIVE',
    });
    await this.corporateMemberRepo.create(member);

    await this.auditLogService.log({
      actorId: actorUserId,
      actorType: 'CUSTOMER',
      action: 'CORPORATE_ACCOUNT_CREATE',
      resource: 'CorporateAccount',
      resourcePublicId: savedAccount.publicId,
      newValue: { companyName: savedAccount.companyName, gstin: savedAccount.gstin },
    });

    return savedAccount;
  }
}
