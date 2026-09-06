import { DomainError } from "@carbroz/foundation-kernel";
import { ICorporateAccountRepository } from "../domain/repositories/ICorporateAccountRepository.js";
import { ICorporateMemberRepository } from "../domain/repositories/ICorporateMemberRepository.js";
import { CorporateMember } from "../domain/CorporateMember.js";
import { IUserRepository } from "@carbroz/domain-identity";
import { AuditLogService } from "@carbroz/domain-audit";
import { AddCorporateMemberDto } from "../dtos/corporate.dto.js";

/** AddCorporateMemberUseCase is an exported domains/enterprise contract/implementation; see the owning README for lifecycle and extension rules. */
export class AddCorporateMemberUseCase {
  constructor(
    private readonly corporateAccountRepo: ICorporateAccountRepository,
    private readonly corporateMemberRepo: ICorporateMemberRepository,
    private readonly userRepository: IUserRepository,
    private readonly auditLogService: AuditLogService,
  ) {}

  /** Executes this application operation through its declared ports and domain invariants. */
  async execute(dto: AddCorporateMemberDto, actorUserId: number) {
    const account = await this.corporateAccountRepo.findByPublicId(
      dto.accountPublicId,
    );
    if (!account) {
      throw new DomainError(
        `Corporate account not found with publicId: ${dto.accountPublicId}`,
      );
    }

    const user = (await (this.userRepository as any).findByEmail)
      ? await (this.userRepository as any).findByEmail(dto.userEmail)
      : null;

    if (!user) {
      throw new DomainError(
        `User with email ${dto.userEmail} does not exist. Please have user register first.`,
      );
    }

    const existingMember = await this.corporateMemberRepo.findByAccountAndUser(
      account.id!,
      user.id!,
    );
    if (existingMember) {
      throw new DomainError(
        `User is already a member of this corporate account.`,
      );
    }

    const member = new CorporateMember({
      corporateAccountId: account.id!,
      userId: user.id!,
      role: dto.role,
      status: "ACTIVE",
      monthlyCapPaise:
        dto.monthlyCapPaise != null ? BigInt(dto.monthlyCapPaise) : null,
    });

    const savedMember = await this.corporateMemberRepo.create(member);

    await this.auditLogService.log({
      actorId: actorUserId,
      actorType: "CUSTOMER",
      action: "CORPORATE_MEMBER_ADD",
      resource: "CorporateMember",
      resourcePublicId: savedMember.publicId,
      newValue: {
        corporateAccountId: account.id,
        userId: user.id,
        role: dto.role,
      },
    });

    return savedMember;
  }
}
