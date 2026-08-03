import { Partner as PrismaPartner } from '@prisma/client';
import { Partner, IPartnerRepository } from '@carbroz/common';
import { PrismaProvider } from '../providers/PrismaProvider.js';
export declare class PrismaPartnerRepository implements IPartnerRepository {
    private readonly prismaProvider;
    private unitOfWorkPrisma;
    constructor(prismaProvider: PrismaProvider);
    private get prisma();
    setUnitOfWork(uow: any): void;
    protected mapToDomain(entity: PrismaPartner): Partner;
    findByPublicId(publicId: string): Promise<Partner | null>;
    findById(id: number): Promise<Partner | null>;
    findAll(): Promise<Partner[]>;
    save(entity: Partner): Promise<Partner>;
    create(data: Partial<Partner>): Promise<Partner>;
    update(id: number, data: Partial<Partner>): Promise<Partner>;
    delete(id: number): Promise<boolean>;
}
