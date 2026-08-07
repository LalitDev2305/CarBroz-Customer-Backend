export class ListCouponsUseCase {
    couponRepository;
    constructor(couponRepository) {
        this.couponRepository = couponRepository;
    }
    async execute() {
        return await this.couponRepository.listActive(new Date());
    }
}
//# sourceMappingURL=ListCouponsUseCase.js.map