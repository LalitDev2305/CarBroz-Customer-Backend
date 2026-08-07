import { Coupon } from '../entities/Coupon.js';
export interface CouponRepository {
    findById(id: number): Promise<Coupon | null>;
    findByCode(code: string): Promise<Coupon | null>;
    listActive(now?: Date): Promise<Coupon[]>;
    create(coupon: Omit<Coupon, 'id' | 'createdAt' | 'updatedAt'>): Promise<Coupon>;
    update(coupon: Coupon): Promise<Coupon>;
}
