import { ICouponRepository } from '@carbroz/foundation-kernel';
export declare class ArchiveCouponUseCase {
    private readonly couponRepository;
    constructor(couponRepository: ICouponRepository);
    execute(publicId: string): Promise<void>;
}
