import { ICouponRepository } from '@carbroz/common';
export declare class ArchiveCouponUseCase {
    private readonly couponRepository;
    constructor(couponRepository: ICouponRepository);
    execute(publicId: string): Promise<void>;
}
