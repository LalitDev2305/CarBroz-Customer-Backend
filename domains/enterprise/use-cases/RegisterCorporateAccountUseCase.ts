import { DomainError } from "@carbroz/foundation-kernel";
import { ICorporateAccountRepository } from "../domain/repositories/ICorporateAccountRepository.js";
import { ICorporateMemberRepository } from "../domain/repositories/ICorporateMemberRepository.js";
import { CorporateAccount } from "../domain/CorporateAccount.js";
import { CorporateMember } from "../domain/CorporateMember.js";
import { IUserRepository } from "@carbroz/domain-identity";
import { AuditLogService } from "@carbroz/domain-audit";
import { RegisterCorporateAccountDto } from "../dtos/corporate.dto.js";

/** RegisterCorporateAccountUseCase is an exported domains/enterprise contract/implementation; see the owning README for lifecycle and extension rules. */
export class RegisterCorporateAccountUseCase {
  constructor(
    private readonly corporateAccountRepo: ICorporateAccountRepository,
    private readonly corporateMemberRepo: ICorporateMemberRepository,
    private readonly userRepository: IUserRepository,
    private readonly auditLogService: AuditLogService,
  ) {}

  /** Executes this application operation through its declared ports and domain invariants. */
  async execute(
    dto: RegisterCorporateAccountDto,
    actorUserId: number,
  ): Promise<CorporateAccount> {
    const existingGstin = await this.corporateAccountRepo.findByGstin(
      dto.gstin,
    );
    if (existingGstin) {
      throw new DomainError(
        `Corporate account with GSTIN ${dto.gstin} already exists`,
      );
    }

    const account = new CorporateAccount({
      companyName: dto.companyName,
      legalName: dto.legalName,
      gstin: dto.gstin,
      pan: dto.pan,
      billingAddress: dto.billingAddress,
      paymentTermsDays: dto.paymentTermsDays ?? 30,
      status: "PENDING_APPROVAL",
      creditLimitPaise: 0n,
      utilisedCreditPaise: 0n,
    });

    const savedAccount = await this.corporateAccountRepo.create(account);

    const member = new CorporateMember({
      corporateAccountId: savedAccount.id!,
      userId: actorUserId,
      role: "CORP_ADMIN",
      status: "ACTIVE",
    });
    await this.corporateMemberRepo.create(member);

    await this.auditLogService.log({
      actorId: actorUserId,
      actorType: "CUSTOMER",
      action: "CORPORATE_ACCOUNT_CREATE",
      resource: "CorporateAccount",
      resourcePublicId: savedAccount.publicId,
      newValue: {
        companyName: savedAccount.companyName,
        gstin: savedAccount.gstin,
      },
    });

    return savedAccount;
  }
}
