import { Coupon } from '../../coupon/domain/Coupon.js';
import { type ICouponRepository } from '../../coupon/domain/repositories/ICouponRepository.js';

export class ListCouponsUseCase {
  constructor(private readonly couponRepository: ICouponRepository) {}

  async execute(): Promise<Coupon[]> {
    return await this.couponRepository.listActive(new Date());
  }
}
