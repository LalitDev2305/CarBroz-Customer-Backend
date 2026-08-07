import { PrismaProvider } from '@carbroz/platform-database';
import { Address } from '../../../domain/entities/Address.js';
export declare class PrismaAddressRepository {
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
