import { PrismaClient } from '@prisma/client';
import { Coupon, ICouponRepository } from '@carbroz/common';
export declare class PrismaCouponRepository implements ICouponRepository {
    private readonly prismaClient;
    private unitOfWorkPrisma;
    constructor(prismaClient: PrismaClient);
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
//# sourceMappingURL=PrismaCouponRepository.d.ts.map