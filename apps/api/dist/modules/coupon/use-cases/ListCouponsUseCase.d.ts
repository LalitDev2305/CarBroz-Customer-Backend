import { Coupon, ICouponRepository } from '@carbroz/foundation-kernel';
export declare class ListCouponsUseCase {
    private readonly couponRepository;
    constructor(couponRepository: ICouponRepository);
    execute(): Promise<Coupon[]>;
}
