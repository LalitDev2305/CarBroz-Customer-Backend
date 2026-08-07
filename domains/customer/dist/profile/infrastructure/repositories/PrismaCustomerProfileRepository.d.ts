import { PrismaClient } from '@prisma/client';
import { ICustomerProfileRepository, CustomerProfile } from '@carbroz/common';
export declare class PrismaCustomerProfileRepository implements ICustomerProfileRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findById(id: number): Promise<CustomerProfile | null>;
    findByUserId(userId: number): Promise<CustomerProfile | null>;
    findAll(): Promise<CustomerProfile[]>;
    save(entity: CustomerProfile): Promise<CustomerProfile>;
    delete(id: number): Promise<boolean>;
}
//# sourceMappingURL=PrismaCustomerProfileRepository.d.ts.map