import { IAddressRepository } from '@carbroz/foundation-kernel';
import { Address } from '@carbroz/foundation-kernel';
import { PrismaProvider } from '../providers/PrismaProvider.js';
export declare class PrismaAddressRepository implements IAddressRepository {
    private readonly prismaProvider;
    constructor(prismaProvider: PrismaProvider);
    private get prisma();
    findById(id: number): Promise<Address | null>;
    findByUserId(userId: number): Promise<Address[]>;
    findDefaultByUserId(userId: number): Promise<Address | null>;
    findAll(): Promise<Address[]>;
    save(entity: Address): Promise<Address>;
    delete(id: number): Promise<boolean>;
}
//# sourceMappingURL=PrismaAddressRepository.d.ts.map