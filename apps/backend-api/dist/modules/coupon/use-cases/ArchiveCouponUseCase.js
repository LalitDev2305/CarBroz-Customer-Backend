export class ArchiveCouponUseCase {
    couponRepository;
    constructor(couponRepository) {
        this.couponRepository = couponRepository;
    }
    async execute(publicId) {
        const coupon = await this.couponRepository.findByPublicId(publicId);
        if (!coupon) {
            throw new Error(`Coupon not found: ${publicId}`);
        }
        coupon.deactivate();
        await this.couponRepository.update(coupon);
    }
}
//# sourceMappingURL=ArchiveCouponUseCase.js.map