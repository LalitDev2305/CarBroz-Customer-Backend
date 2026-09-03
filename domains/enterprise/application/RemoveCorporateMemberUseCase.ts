import { type ICorporateAccountRepository } from '../domain/corporate/repositories/ICorporateAccountRepository.js';
import { type ICorporateMemberRepository } from '../domain/corporate/repositories/ICorporateMemberRepository.js';
import { AuditLogService } from '@carbroz/domain-audit';
import { type RemoveCorporateMemberDto } from './contracts/corporate.contracts.js';

export class RemoveCorporateMemberUseCase {
  constructor(
    private readonly corporateAccountRepo: ICorporateAccountRepository,
    private readonly corporateMemberRepo: ICorporateMemberRepository,
    private readonly auditLogService: AuditLogService
  ) {}

  async execute(dto: RemoveCorporateMemberDto, actorUserId: number) {
    const account = await this.corporateAccountRepo.findByPublicId(dto.accountPublicId);
    if (!account) {
      throw new Error(`Corporate account not found with publicId: ${dto.accountPublicId}`);
    }

    const member = await this.corporateMemberRepo.findByPublicId(dto.memberPublicId);
    if (!member || member.corporateAccountId !== account.id) {
      throw new Error(`Corporate member not found`);
    }

    member.deactivate();
    await this.corporateMemberRepo.update(member);

    await this.auditLogService.log({
      actorId: actorUserId,
      actorType: 'CUSTOMER',
      action: 'CORPORATE_MEMBER_REMOVE',
      resource: 'CorporateMember',
      resourcePublicId: member.publicId,
      oldValue: { status: 'ACTIVE' },
      newValue: { status: 'INACTIVE' },
    });
  }
}
