import { DomainError } from "@carbroz/foundation-kernel";
import { ICorporateAccountRepository } from "../domain/repositories/ICorporateAccountRepository.js";
import { ICorporateMemberRepository } from "../domain/repositories/ICorporateMemberRepository.js";
import { AuditLogService } from "@carbroz/domain-audit";
import { RemoveCorporateMemberDto } from "../dtos/corporate.dto.js";

/** RemoveCorporateMemberUseCase is an exported domains/enterprise contract/implementation; see the owning README for lifecycle and extension rules. */
export class RemoveCorporateMemberUseCase {
  constructor(
    private readonly corporateAccountRepo: ICorporateAccountRepository,
    private readonly corporateMemberRepo: ICorporateMemberRepository,
    private readonly auditLogService: AuditLogService,
  ) {}

  /** Executes this application operation through its declared ports and domain invariants. */
  async execute(dto: RemoveCorporateMemberDto, actorUserId: number) {
    const account = await this.corporateAccountRepo.findByPublicId(
      dto.accountPublicId,
    );
    if (!account) {
      throw new DomainError(
        `Corporate account not found with publicId: ${dto.accountPublicId}`,
      );
    }

    const member = await this.corporateMemberRepo.findByPublicId(
      dto.memberPublicId,
    );
    if (!member || member.corporateAccountId !== account.id) {
      throw new DomainError(`Corporate member not found`);
    }

    member.deactivate();
    await this.corporateMemberRepo.update(member);

    await this.auditLogService.log({
      actorId: actorUserId,
      actorType: "CUSTOMER",
      action: "CORPORATE_MEMBER_REMOVE",
      resource: "CorporateMember",
      resourcePublicId: member.publicId,
      oldValue: { status: "ACTIVE" },
      newValue: { status: "INACTIVE" },
    });
  }
}
