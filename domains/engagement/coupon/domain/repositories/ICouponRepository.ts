import { Coupon } from '../../../coupon/domain/Coupon.js';

export interface ICouponRepository {
  create(coupon: Coupon): Promise<Coupon>;
  findById(id: number): Promise<Coupon | null>;
  findByPublicId(publicId: string): Promise<Coupon | null>;
  findByCode(code: string): Promise<Coupon | null>;
  listActive(now?: Date): Promise<Coupon[]>;
  update(coupon: Coupon): Promise<Coupon>;
  incrementUsage(couponId: number): Promise<void>;
}
