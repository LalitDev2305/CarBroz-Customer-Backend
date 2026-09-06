import { Coupon } from '../../domain/Coupon.js';
import { ICouponRepository } from '../../domain/repositories/ICouponRepository.js';
/** ListCouponsUseCase is an exported domains/engagement contract/implementation; see the owning README for lifecycle and extension rules. */
export class ListCouponsUseCase {
  constructor(private readonly couponRepository: ICouponRepository) {}

  /** Executes this application operation through its declared ports and domain invariants. */
  async execute(): Promise<Coupon[]> {
    return await this.couponRepository.listActive(new Date());
  }
}
