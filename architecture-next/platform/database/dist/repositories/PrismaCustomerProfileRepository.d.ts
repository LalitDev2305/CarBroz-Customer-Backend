import { ICustomerProfileRepository } from '@carbroz/common';
import { CustomerProfile } from '@carbroz/common';
import { PrismaProvider } from '../providers/PrismaProvider.js';
export declare class PrismaCustomerProfileRepository implements ICustomerProfileRepository {
    private readonly prismaProvider;
    constructor(prismaProvider: PrismaProvider);
    private get prisma();
    findById(id: number): Promise<CustomerProfile | null>;
    findByUserId(userId: number): Promise<CustomerProfile | null>;
    findAll(): Promise<CustomerProfile[]>;
    save(entity: CustomerProfile): Promise<CustomerProfile>;
    delete(id: number): Promise<boolean>;
}
//# sourceMappingURL=PrismaCustomerProfileRepository.d.ts.map