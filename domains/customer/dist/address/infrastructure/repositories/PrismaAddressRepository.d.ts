import { PrismaClient } from '@prisma/client';
import { IAddressRepository, Address } from '@carbroz/common';
export declare class PrismaAddressRepository implements IAddressRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findById(id: number): Promise<Address | null>;
    findByUserId(userId: number): Promise<Address[]>;
    findDefaultByUserId(userId: number): Promise<Address | null>;
    findAll(): Promise<Address[]>;
    save(entity: Address): Promise<Address>;
    delete(id: number): Promise<boolean>;
}
//# sourceMappingURL=PrismaAddressRepository.d.ts.map