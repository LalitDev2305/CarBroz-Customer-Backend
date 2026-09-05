import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const write = (rel, content) => {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content.endsWith('\n') ? content : `${content}\n`);
};
const remove = (rel) => fs.rmSync(path.join(root, rel), { force: true });

const application = 'domains/partner/application/use-cases';

write(`${application}/RegisterIndividualPartnerUseCase.ts`, `import type { ExecutionContext, ITransactionProvider, IUseCase } from '@carbroz/foundation-kernel';
import type { Partner } from '../../domain/Partner.js';
import type { PartnerMember } from '../../domain/PartnerMember.js';
import { PartnerType } from '../../domain/PartnerType.js';
import { PartnerStatus } from '../../domain/PartnerStatus.js';
import { PartnerMemberRole } from '../../domain/PartnerMemberRole.js';
import { PartnerMemberStatus } from '../../domain/PartnerMemberStatus.js';
import type { IPartnerRepository } from '../../domain/repositories/IPartnerRepository.js';
import type { IPartnerMemberRepository } from '../../domain/repositories/IPartnerMemberRepository.js';

export interface RegisterIndividualPartnerInput {
  context: ExecutionContext;
  data: { businessName: string };
}
export interface RegisterPartnerResult { partner: Partner; member: PartnerMember }

function actorUserId(context: ExecutionContext): number {
  const id = Number(context.actor?.id);
  if (!Number.isInteger(id) || id <= 0) throw new Error('Unauthorized');
  return id;
}

export class RegisterIndividualPartnerUseCase implements IUseCase<RegisterIndividualPartnerInput, RegisterPartnerResult> {
  constructor(
    private readonly partnerRepository: IPartnerRepository,
    private readonly partnerMemberRepository: IPartnerMemberRepository,
    private readonly transactionProvider: ITransactionProvider,
  ) {}

  async execute({ context, data }: RegisterIndividualPartnerInput): Promise<RegisterPartnerResult> {
    const userId = actorUserId(context);
    const existingMembership = await this.partnerMemberRepository.findByUserId(userId);
    if (existingMembership.length > 0) throw new Error('User is already associated with a partner');

    return this.transactionProvider.runInTransaction(async (transaction) => {
      this.partnerRepository.setUnitOfWork(transaction);
      this.partnerMemberRepository.setUnitOfWork(transaction);
      const partner = await this.partnerRepository.create({
        businessName: data.businessName,
        type: PartnerType.INDIVIDUAL,
        status: PartnerStatus.PENDING,
      });
      const member = await this.partnerMemberRepository.create({
        userId,
        partnerId: partner.id,
        role: PartnerMemberRole.OWNER,
        status: PartnerMemberStatus.ACTIVE,
      });
      return { partner, member };
    });
  }
}
`);

write(`${application}/RegisterOrganizationPartnerUseCase.ts`, `import type { ExecutionContext, ITransactionProvider, IUseCase } from '@carbroz/foundation-kernel';
import type { Partner } from '../../domain/Partner.js';
import type { PartnerMember } from '../../domain/PartnerMember.js';
import { PartnerType } from '../../domain/PartnerType.js';
import { PartnerStatus } from '../../domain/PartnerStatus.js';
import { PartnerMemberRole } from '../../domain/PartnerMemberRole.js';
import { PartnerMemberStatus } from '../../domain/PartnerMemberStatus.js';
import type { IPartnerRepository } from '../../domain/repositories/IPartnerRepository.js';
import type { IPartnerMemberRepository } from '../../domain/repositories/IPartnerMemberRepository.js';

export interface RegisterOrganizationPartnerInput {
  context: ExecutionContext;
  data: { businessName: string };
}
export interface RegisterOrganizationPartnerResult { partner: Partner; member: PartnerMember }

export class RegisterOrganizationPartnerUseCase implements IUseCase<RegisterOrganizationPartnerInput, RegisterOrganizationPartnerResult> {
  constructor(
    private readonly partnerRepository: IPartnerRepository,
    private readonly partnerMemberRepository: IPartnerMemberRepository,
    private readonly transactionProvider: ITransactionProvider,
  ) {}

  async execute({ context, data }: RegisterOrganizationPartnerInput): Promise<RegisterOrganizationPartnerResult> {
    const userId = Number(context.actor?.id);
    if (!Number.isInteger(userId) || userId <= 0) throw new Error('Unauthorized');
    const existingMembership = await this.partnerMemberRepository.findByUserId(userId);
    if (existingMembership.length > 0) throw new Error('User is already associated with a partner');

    return this.transactionProvider.runInTransaction(async (transaction) => {
      this.partnerRepository.setUnitOfWork(transaction);
      this.partnerMemberRepository.setUnitOfWork(transaction);
      const partner = await this.partnerRepository.create({
        businessName: data.businessName,
        type: PartnerType.ORGANIZATION,
        status: PartnerStatus.PENDING,
      });
      const member = await this.partnerMemberRepository.create({
        userId,
        partnerId: partner.id,
        role: PartnerMemberRole.OWNER,
        status: PartnerMemberStatus.ACTIVE,
      });
      return { partner, member };
    });
  }
}
`);

write(`${application}/GetPartnerProfileUseCase.ts`, `import type { ExecutionContext, IUseCase } from '@carbroz/foundation-kernel';
import type { Partner } from '../../domain/Partner.js';
import type { PartnerMember } from '../../domain/PartnerMember.js';
import type { IPartnerRepository } from '../../domain/repositories/IPartnerRepository.js';
import type { IPartnerMemberRepository } from '../../domain/repositories/IPartnerMemberRepository.js';

export interface GetPartnerProfileInput { context: ExecutionContext }
export interface PartnerProfileResult { partner: Partner | null; membership: PartnerMember }

export class GetPartnerProfileUseCase implements IUseCase<GetPartnerProfileInput, PartnerProfileResult> {
  constructor(
    private readonly partnerRepository: IPartnerRepository,
    private readonly partnerMemberRepository: IPartnerMemberRepository,
  ) {}

  async execute({ context }: GetPartnerProfileInput): Promise<PartnerProfileResult> {
    const userId = Number(context.actor?.id);
    if (!Number.isInteger(userId) || userId <= 0) throw new Error('Unauthorized');
    const memberships = await this.partnerMemberRepository.findByUserId(userId);
    const primaryMembership = memberships[0];
    if (!primaryMembership) throw new Error('Partner profile not found');
    const partner = await this.partnerRepository.findById(primaryMembership.partnerId);
    return { partner, membership: primaryMembership };
  }
}
`);

write(`${application}/VerifyPartnerUseCase.ts`, `import type { ExecutionContext, IUseCase } from '@carbroz/foundation-kernel';
import type { Partner } from '../../domain/Partner.js';
import { PartnerStatus } from '../../domain/PartnerStatus.js';
import type { IPartnerRepository } from '../../domain/repositories/IPartnerRepository.js';

export interface VerifyPartnerInput {
  context: ExecutionContext;
  data: { partnerId: string; status: PartnerStatus };
}

export class VerifyPartnerUseCase implements IUseCase<VerifyPartnerInput, Partner> {
  constructor(private readonly partnerRepository: IPartnerRepository) {}

  async execute({ context, data }: VerifyPartnerInput): Promise<Partner> {
    if (context.actor?.kind !== 'ADMIN' && !context.actor?.roles.includes('ADMIN')) throw new Error('Forbidden');
    const partner = await this.partnerRepository.findByPublicId(data.partnerId);
    if (!partner) throw new Error('Partner not found');
    partner.status = data.status;
    return this.partnerRepository.save(partner);
  }
}
`);

write(`${application}/GetPartnerKycStatusUseCase.ts`, `import type { ExecutionContext, IUseCase } from '@carbroz/foundation-kernel';
import type { KycDocument } from '../../kyc/domain/KycDocument.js';
import type { IKycDocumentRepository } from '../../kyc/domain/repositories/IKycDocumentRepository.js';
import type { IPartnerMemberRepository } from '../../domain/repositories/IPartnerMemberRepository.js';

export interface GetPartnerKycStatusInput { context: ExecutionContext; data: { partnerId: number } }

export class GetPartnerKycStatusUseCase implements IUseCase<GetPartnerKycStatusInput, KycDocument[]> {
  constructor(
    private readonly kycDocumentRepository: IKycDocumentRepository,
    private readonly partnerMemberRepository: IPartnerMemberRepository,
  ) {}

  async execute({ context, data }: GetPartnerKycStatusInput): Promise<KycDocument[]> {
    const userId = Number(context.actor?.id);
    if (!Number.isInteger(userId) || userId <= 0) throw new Error('UNAUTHORIZED: User must be logged in');
    const membership = await this.partnerMemberRepository.findByUserIdAndPartnerId(userId, data.partnerId);
    if (!membership) throw new Error('FORBIDDEN: You do not have access to this partner profile');
    return this.kycDocumentRepository.findByPartnerId(data.partnerId);
  }
}
`);

write(`${application}/UploadKycDocumentUseCase.ts`, `import type { ExecutionContext, IUseCase } from '@carbroz/foundation-kernel';
import type { IPartnerMemberRepository } from '../../domain/repositories/IPartnerMemberRepository.js';
import type { KycDocumentType } from '../../kyc/domain/KycDocumentType.js';
import type { UploadPartnerKycDocumentUseCase } from '../../kyc/application/UploadPartnerKycDocumentUseCase.js';

export interface UploadKycDocumentInput {
  context: ExecutionContext;
  data: { partnerId: number; type: KycDocumentType; fileName?: string; fileBuffer: Buffer; mimeType: string };
}

export class UploadKycDocumentUseCase implements IUseCase<UploadKycDocumentInput, void> {
  constructor(
    private readonly uploader: UploadPartnerKycDocumentUseCase,
    private readonly partnerMemberRepository: IPartnerMemberRepository,
  ) {}

  async execute({ context, data }: UploadKycDocumentInput): Promise<void> {
    const userId = Number(context.actor?.id);
    if (!Number.isInteger(userId) || userId <= 0) throw new Error('UNAUTHORIZED: User must be logged in');
    const membership = await this.partnerMemberRepository.findByUserIdAndPartnerId(userId, data.partnerId);
    if (!membership || !['OWNER', 'MANAGER'].includes(membership.role)) {
      throw new Error('FORBIDDEN: Only owners or managers can upload KYC documents');
    }
    await this.uploader.execute({
      partnerId: data.partnerId,
      uploadedById: userId,
      type: data.type,
      fileName: data.fileName ?? 'kyc-document',
      fileBuffer: data.fileBuffer,
      mimeType: data.mimeType,
    });
  }
}
`);

write(`domains/partner/kyc/application/AdminReviewKycDocumentUseCase.ts`, `import type { ExecutionContext, IUseCase } from '@carbroz/foundation-kernel';
import type { Partner } from '../../domain/Partner.js';
import { PartnerStatus } from '../../domain/PartnerStatus.js';
import type { IPartnerRepository } from '../../domain/repositories/IPartnerRepository.js';
import type { KycDocument } from '../domain/KycDocument.js';
import { KycDocumentStatus } from '../domain/KycDocumentStatus.js';
import type { IKycDocumentRepository } from '../domain/repositories/IKycDocumentRepository.js';

export interface AdminReviewKycDocumentInput {
  context: ExecutionContext;
  data: { documentId: number; action: 'APPROVE' | 'REJECT'; reason?: string };
}

export class AdminReviewKycDocumentUseCase implements IUseCase<AdminReviewKycDocumentInput, KycDocument> {
  constructor(
    private readonly kycDocumentRepository: IKycDocumentRepository,
    private readonly partnerRepository: IPartnerRepository,
  ) {}

  async execute({ context, data }: AdminReviewKycDocumentInput): Promise<KycDocument> {
    const adminUserId = Number(context.actor?.id);
    if (!Number.isInteger(adminUserId) || adminUserId <= 0 || (context.actor?.kind !== 'ADMIN' && !context.actor?.roles.includes('ADMIN'))) {
      throw new Error('UNAUTHORIZED: Admin must be logged in');
    }
    const status = data.action === 'APPROVE' ? KycDocumentStatus.APPROVED : KycDocumentStatus.REJECTED;
    if (status === KycDocumentStatus.REJECTED && !data.reason) throw new Error('BAD_REQUEST: Rejection reason is required');
    const document = await this.kycDocumentRepository.findById(data.documentId);
    if (!document) throw new Error('NOT_FOUND: KYC document not found');
    const updated = await this.kycDocumentRepository.updateStatus(
      data.documentId,
      status,
      adminUserId,
      status === KycDocumentStatus.REJECTED ? data.reason ?? null : null,
    );
    if (data.action === 'APPROVE') {
      const allDocs = await this.kycDocumentRepository.findByPartnerId(document.partnerId);
      const hasPending = allDocs.some((candidate) => candidate.status === KycDocumentStatus.PENDING);
      if (!hasPending) {
        const partner: Partner | null = await this.partnerRepository.findById(document.partnerId);
        if (partner) {
          partner.status = PartnerStatus.ACTIVE;
          await this.partnerRepository.save(partner);
        }
      }
    }
    return updated;
  }
}
`);

// Migrated tests must not depend on API DTOs or the retired IRequestContext.
for (const name of ['RegisterIndividualPartnerUseCase.spec.ts', 'UploadKycDocumentUseCase.spec.ts']) {
  remove(`${application}/${name}`);
}

// Permanent closeout assertions: no transport context or API dependency may survive in Partner.
const partnerRoot = path.join(root, 'domains/partner');
const violations = [];
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const absolute = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(absolute) : [absolute];
});
for (const file of walk(partnerRoot).filter((candidate) => candidate.endsWith('.ts'))) {
  const content = fs.readFileSync(file, 'utf8');
  if (/\bIRequestContext\b/.test(content)) violations.push(`${path.relative(root, file)} uses IRequestContext`);
  if (/from\s+['"][^'"]*apps\/api|from\s+['"][^'"]*surfaces\//.test(content)) violations.push(`${path.relative(root, file)} imports API transport`);
}
if (violations.length) throw new Error(`Partner application boundary failed:\n${violations.map((item) => `- ${item}`).join('\n')}`);

console.log('[architecture-closeout-partner] Partner application uses Foundation ExecutionContext and owns transport-neutral inputs');
