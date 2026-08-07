import { PrismaProvider } from '@carbroz/platform-database';
import { Coupon } from '../../../domain/entities/Coupon.js';
export declare class PrismaCouponRepository {
    private readonly prismaProvider;
    private unitOfWorkPrisma;
    constructor(prismaProvider: PrismaProvider);
    private get prisma();
    private mapToDomain;
    create(coupon: Coupon): Promise<Coupon>;
    findById(id: number): Promise<Coupon | null>;
    findByPublicId(publicId: string): Promise<Coupon | null>;
    findByCode(code: string): Promise<Coupon | null>;
    listActive(now?: Date): Promise<Coupon[]>;
    update(coupon: Coupon): Promise<Coupon>;
    incrementUsage(couponId: number): Promise<void>;
}
