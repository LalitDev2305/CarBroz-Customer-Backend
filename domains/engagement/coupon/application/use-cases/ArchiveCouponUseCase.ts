import { ICouponRepository } from '../../domain/repositories/ICouponRepository.js';
/** ArchiveCouponUseCase is an exported domains/engagement contract/implementation; see the owning README for lifecycle and extension rules. */
export class ArchiveCouponUseCase {
  constructor(private readonly couponRepository: ICouponRepository) {}

  /** Executes this application operation through its declared ports and domain invariants. */
  async execute(publicId: string): Promise<void> {
    const coupon = await this.couponRepository.findByPublicId(publicId);
    if (!coupon) {
      throw new Error(`Coupon not found: ${publicId}`);
    }

    coupon.deactivate();
    await this.couponRepository.update(coupon);
  }
}
