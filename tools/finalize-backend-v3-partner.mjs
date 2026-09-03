import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const p = (...parts) => path.join(root, ...parts);
const write = (relative, content) => {
  const file = p(relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};
const patch = (relative, transform) => {
  const file = p(relative);
  if (!fs.existsSync(file)) return;
  const before = fs.readFileSync(file, 'utf8');
  const after = transform(before);
  if (after !== before) fs.writeFileSync(file, after);
};

write('domains/partner/profile/domain/repositories/IPartnerRepository.ts', `import type { IRepository } from '@carbroz/foundation-kernel';
import type { Partner } from '../Partner.js';

export interface IPartnerRepository extends IRepository<Partner, number> {
  findByPublicId(publicId: string): Promise<Partner | null>;
  create(data: Partial<Partner>): Promise<Partner>;
  setUnitOfWork(uow: unknown): void;
}
`);

write('domains/partner/profile/domain/repositories/IPartnerMemberRepository.ts', `import type { IRepository } from '@carbroz/foundation-kernel';
import type { PartnerMember } from '../PartnerMember.js';

export interface IPartnerMemberRepository extends IRepository<PartnerMember, number> {
  findByPublicId(publicId: string): Promise<PartnerMember | null>;
  findByUserIdAndPartnerId(userId: number, partnerId: number): Promise<PartnerMember | null>;
  findByUserId(userId: number): Promise<PartnerMember[]>;
  findByPartnerId(partnerId: number): Promise<PartnerMember[]>;
  create(data: Partial<PartnerMember>): Promise<PartnerMember>;
  setUnitOfWork(uow: unknown): void;
}
`);

write('domains/partner/profile/domain/repositories/IPartnerProfileRepository.ts', `import type { IRepository } from '@carbroz/foundation-kernel';
import type { PartnerProfile } from '../PartnerProfile.js';

export interface IPartnerProfileRepository extends IRepository<PartnerProfile, number> {
  findByPublicId(publicId: string): Promise<PartnerProfile | null>;
  findByPartnerId(partnerId: number): Promise<PartnerProfile | null>;
  create(profile: Omit<PartnerProfile, 'id' | 'publicId' | 'createdAt' | 'updatedAt'>): Promise<PartnerProfile>;
  update(id: number, profile: Partial<PartnerProfile>): Promise<PartnerProfile>;
}
`);

write('domains/partner/profile/infrastructure/repositories/PrismaPartnerRepository.ts', `import type { PrismaClient } from '@prisma/client';
import type { Partner } from '../../domain/Partner.js';
import type { PartnerStatus } from '../../domain/PartnerStatus.js';
import type { PartnerType } from '../../domain/PartnerType.js';
import type { IPartnerRepository } from '../../domain/repositories/IPartnerRepository.js';

export class PrismaPartnerRepository implements IPartnerRepository {
  private unitOfWorkPrisma: any = null;
  constructor(private readonly prismaClient: PrismaClient) {}
  private get prisma(): any { return this.unitOfWorkPrisma ?? this.prismaClient; }
  setUnitOfWork(uow: unknown): void { this.unitOfWorkPrisma = uow; }
  private map(entity: any): Partner {
    return { id: entity.id, publicId: entity.publicId, businessName: entity.businessName, type: entity.type as PartnerType, status: entity.status as PartnerStatus, createdAt: entity.createdAt, updatedAt: entity.updatedAt, ...(entity.deletedAt !== undefined ? { deletedAt: entity.deletedAt } : {}) };
  }
  async findById(id: number): Promise<Partner | null> { const entity = await this.prisma.partner.findUnique({ where: { id } }); return entity ? this.map(entity) : null; }
  async findByPublicId(publicId: string): Promise<Partner | null> { const entity = await this.prisma.partner.findUnique({ where: { publicId } }); return entity ? this.map(entity) : null; }
  async findAll(): Promise<Partner[]> { return (await this.prisma.partner.findMany()).map((entity: any) => this.map(entity)); }
  async create(data: Partial<Partner>): Promise<Partner> {
    const entity = await this.prisma.partner.create({ data: { businessName: data.businessName!, type: data.type!, status: data.status! } });
    return this.map(entity);
  }
  async save(partner: Partner): Promise<Partner> {
    const entity = await this.prisma.partner.update({ where: { id: partner.id }, data: { businessName: partner.businessName, type: partner.type, status: partner.status, deletedAt: partner.deletedAt ?? null } });
    return this.map(entity);
  }
  async delete(id: number): Promise<boolean> { await this.prisma.partner.update({ where: { id }, data: { deletedAt: new Date() } }); return true; }
}
`);

write('domains/partner/profile/infrastructure/repositories/PrismaPartnerMemberRepository.ts', `import type { PrismaClient } from '@prisma/client';
import type { PartnerMember } from '../../domain/PartnerMember.js';
import type { PartnerMemberRole } from '../../domain/PartnerMemberRole.js';
import type { PartnerMemberStatus } from '../../domain/PartnerMemberStatus.js';
import type { IPartnerMemberRepository } from '../../domain/repositories/IPartnerMemberRepository.js';

export class PrismaPartnerMemberRepository implements IPartnerMemberRepository {
  private unitOfWorkPrisma: any = null;
  constructor(private readonly prismaClient: PrismaClient) {}
  private get prisma(): any { return this.unitOfWorkPrisma ?? this.prismaClient; }
  setUnitOfWork(uow: unknown): void { this.unitOfWorkPrisma = uow; }
  private map(entity: any): PartnerMember { return { id: entity.id, publicId: entity.publicId, userId: entity.userId, partnerId: entity.partnerId, role: entity.role as PartnerMemberRole, status: entity.status as PartnerMemberStatus, createdAt: entity.createdAt, updatedAt: entity.updatedAt }; }
  async findById(id: number): Promise<PartnerMember | null> { const entity = await this.prisma.partnerMember.findUnique({ where: { id } }); return entity ? this.map(entity) : null; }
  async findByPublicId(publicId: string): Promise<PartnerMember | null> { const entity = await this.prisma.partnerMember.findUnique({ where: { publicId } }); return entity ? this.map(entity) : null; }
  async findByUserIdAndPartnerId(userId: number, partnerId: number): Promise<PartnerMember | null> { const entity = await this.prisma.partnerMember.findUnique({ where: { userId_partnerId: { userId, partnerId } } }); return entity ? this.map(entity) : null; }
  async findByUserId(userId: number): Promise<PartnerMember[]> { return (await this.prisma.partnerMember.findMany({ where: { userId } })).map((entity: any) => this.map(entity)); }
  async findByPartnerId(partnerId: number): Promise<PartnerMember[]> { return (await this.prisma.partnerMember.findMany({ where: { partnerId } })).map((entity: any) => this.map(entity)); }
  async findAll(): Promise<PartnerMember[]> { return (await this.prisma.partnerMember.findMany()).map((entity: any) => this.map(entity)); }
  async create(data: Partial<PartnerMember>): Promise<PartnerMember> { const entity = await this.prisma.partnerMember.create({ data: { userId: data.userId!, partnerId: data.partnerId!, role: data.role!, status: data.status! } }); return this.map(entity); }
  async save(member: PartnerMember): Promise<PartnerMember> { const entity = await this.prisma.partnerMember.update({ where: { id: member.id }, data: { role: member.role, status: member.status } }); return this.map(entity); }
  async delete(id: number): Promise<boolean> { await this.prisma.partnerMember.delete({ where: { id } }); return true; }
}
`);

write('domains/partner/profile/infrastructure/repositories/PrismaPartnerProfileRepository.ts', `import type { PrismaClient } from '@prisma/client';
import type { PartnerProfile } from '../../domain/PartnerProfile.js';
import type { IPartnerProfileRepository } from '../../domain/repositories/IPartnerProfileRepository.js';

export class PrismaPartnerProfileRepository implements IPartnerProfileRepository {
  constructor(private readonly prismaClient: PrismaClient) {}
  private map(entity: any): PartnerProfile { return { id: entity.id, publicId: entity.publicId, partnerId: entity.partnerId, description: entity.description, logoUrl: entity.logoUrl, supportEmail: entity.supportEmail, supportPhone: entity.supportPhone, createdAt: entity.createdAt, updatedAt: entity.updatedAt }; }
  async findById(id: number): Promise<PartnerProfile | null> { const entity = await this.prismaClient.partnerProfile.findUnique({ where: { id } }); return entity ? this.map(entity) : null; }
  async findByPublicId(publicId: string): Promise<PartnerProfile | null> { const entity = await this.prismaClient.partnerProfile.findUnique({ where: { publicId } }); return entity ? this.map(entity) : null; }
  async findByPartnerId(partnerId: number): Promise<PartnerProfile | null> { const entity = await this.prismaClient.partnerProfile.findUnique({ where: { partnerId } }); return entity ? this.map(entity) : null; }
  async findAll(): Promise<PartnerProfile[]> { return (await this.prismaClient.partnerProfile.findMany()).map((entity: any) => this.map(entity)); }
  async create(profile: Omit<PartnerProfile, 'id' | 'publicId' | 'createdAt' | 'updatedAt'>): Promise<PartnerProfile> { const entity = await this.prismaClient.partnerProfile.create({ data: profile }); return this.map(entity); }
  async update(id: number, profile: Partial<PartnerProfile>): Promise<PartnerProfile> { const entity = await this.prismaClient.partnerProfile.update({ where: { id }, data: profile }); return this.map(entity); }
  async save(profile: PartnerProfile): Promise<PartnerProfile> { return this.update(profile.id, profile); }
  async delete(id: number): Promise<boolean> { await this.prismaClient.partnerProfile.delete({ where: { id } }); return true; }
}
`);

// KYC persistence must omit optional undefined values rather than forwarding
// them into exactOptionalPropertyTypes contracts.
patch('domains/partner/kyc/infrastructure/repositories/PrismaKycDocumentRepository.ts', (text) => {
  text = text.replace(/publicId:\s*entity\.publicId,/, 'publicId: entity.publicId,');
  text = text.replace(/rejectionReason:\s*document\.rejectionReason,/, '...(document.rejectionReason !== undefined ? { rejectionReason: document.rejectionReason } : {}),');
  text = text.replace(/verifiedById:\s*document\.verifiedById,/, '...(document.verifiedById !== undefined ? { verifiedById: document.verifiedById } : {}),');
  for (const name of ['type','fileUrl','status','rejectionReason','uploadedById','verifiedById']) {
    const rx = new RegExp(`${name}:\\s*data\\.${name},`, 'g');
    text = text.replace(rx, `...(data.${name} !== undefined ? { ${name}: data.${name} } : {}),`);
  }
  text = text.replace(/data:\s*\{ status, verifiedById, rejectionReason \}/, 'data: { status, verifiedById, ...(rejectionReason !== undefined ? { rejectionReason } : {}) }');
  return text;
});

// The common Storage contract was already classified into platform/storage;
// make it reachable only through the platform public boundary.
patch('platform/storage/src/public/index.ts', (text) => text.includes('IStorageProvider') ? text : `export * from './IStorageProvider.js';\n${text}`);
patch('platform/storage/src/index.ts', (text) => text.includes("./public/index.js") ? text : `export * from './public/index.js';\n${text}`);

patch('domains/partner/application/self-service/UploadKycDocumentUseCase.spec.ts', (text) =>
  text.replace(/import \{([^}]*)Mocked([^}]*)\} from 'vitest';/, (_all, before, after) => `import {${before}type Mocked${after}} from 'vitest';`)
);

console.log('Backend V3 Partner bounded context finalized.');
