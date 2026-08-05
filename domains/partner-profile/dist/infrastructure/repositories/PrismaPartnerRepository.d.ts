import { PrismaClient } from '@prisma/client';
import { Partner, PartnerStatus, PartnerType, IPartnerRepository } from '@carbroz/common';
export declare class PrismaPartnerRepository implements IPartnerRepository {
    private readonly prismaClient;
    private unitOfWorkPrisma;
    constructor(prismaClient: PrismaClient);
    private get prisma();
    setUnitOfWork(uow: any): void;
    private mapToDomain;
    findById(id: number): Promise<Partner | null>;
    findByPublicId(publicId: string): Promise<Partner | null>;
    findByCode(code: string): Promise<Partner | null>;
    findAll(): Promise<Partner[]>;
    findByType(type: PartnerType): Promise<Partner[]>;
    findByStatus(status: PartnerStatus): Promise<Partner[]>;
    save(partner: Partner): Promise<Partner>;
    updateStatus(id: number, status: PartnerStatus): Promise<Partner>;
    delete(id: number): Promise<boolean>;
}
//# sourceMappingURL=PrismaPartnerRepository.d.ts.map