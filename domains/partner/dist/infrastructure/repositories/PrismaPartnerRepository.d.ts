import { PrismaProvider } from '@carbroz/platform-database';
import { Partner } from '../../domain/Partner.js';
import { PartnerStatus } from '../../domain/PartnerStatus.js';
import { PartnerType } from '../../domain/PartnerType.js';
export declare class PrismaPartnerRepository {
    private readonly prismaProvider;
    private unitOfWorkPrisma;
    constructor(prismaProvider: PrismaProvider);
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