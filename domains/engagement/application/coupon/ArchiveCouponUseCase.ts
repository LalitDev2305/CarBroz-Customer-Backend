import { type ICouponRepository } from '../../coupon/domain/repositories/ICouponRepository.js';

export class ArchiveCouponUseCase {
  constructor(private readonly couponRepository: ICouponRepository) {}

  async execute(publicId: string): Promise<void> {
    const coupon = await this.couponRepository.findByPublicId(publicId);
    if (!coupon) {
      throw new Error(`Coupon not found: ${publicId}`);
    }

    coupon.deactivate();
    await this.couponRepository.update(coupon);
  }
}
