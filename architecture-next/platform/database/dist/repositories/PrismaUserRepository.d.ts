import { User, IUserRepository } from '@carbroz/common';
import { PrismaProvider } from '../providers/PrismaProvider.js';
export declare class PrismaUserRepository implements IUserRepository {
    private readonly prisma;
    constructor(prismaProvider: PrismaProvider);
    findById(id: number): Promise<User | null>;
    findAll(): Promise<User[]>;
    create(data: Partial<User>): Promise<User>;
    update(id: number, data: Partial<User>): Promise<User>;
    save(entity: User): Promise<User>;
    delete(id: number): Promise<boolean>;
    findByPhoneNumber(phoneNumber: string): Promise<User | null>;
    upsert(phoneNumber: string, data: Partial<User>): Promise<User>;
    private mapToDomain;
}
//# sourceMappingURL=PrismaUserRepository.d.ts.map