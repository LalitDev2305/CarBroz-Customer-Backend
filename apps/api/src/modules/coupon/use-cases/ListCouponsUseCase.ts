import { Coupon, ICouponRepository } from '@carbroz/common';

export class ListCouponsUseCase {
  constructor(private readonly couponRepository: ICouponRepository) {}

  async execute(): Promise<Coupon[]> {
    return await this.couponRepository.listActive(new Date());
  }
}
