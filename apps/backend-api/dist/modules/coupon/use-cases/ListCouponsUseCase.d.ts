import { Coupon, ICouponRepository } from '@carbroz/common';
export declare class ListCouponsUseCase {
    private readonly couponRepository;
    constructor(couponRepository: ICouponRepository);
    execute(): Promise<Coupon[]>;
}
