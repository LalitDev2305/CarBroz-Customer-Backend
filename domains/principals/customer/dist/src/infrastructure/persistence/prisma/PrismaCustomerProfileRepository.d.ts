import { PrismaProvider } from '@carbroz/platform-database';
import { CustomerProfile } from '../../../domain/entities/CustomerProfile.js';
export declare class PrismaCustomerProfileRepository {
    private readonly prismaProvider;
    constructor(prismaProvider: PrismaProvider);
    private get prisma();
    findById(id: number): Promise<CustomerProfile | null>;
    findByUserId(userId: number): Promise<CustomerProfile | null>;
    findAll(): Promise<CustomerProfile[]>;
    save(entity: CustomerProfile): Promise<CustomerProfile>;
    delete(id: number): Promise<boolean>;
}
