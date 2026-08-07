import { PrismaProvider } from '@carbroz/platform-database';
import { Review } from '../../domain/Review.js';
import { PartnerRatingStats } from '../../domain/PartnerRatingStats.js';
export declare class PrismaReviewRepository {
    private readonly prismaProvider;
    private unitOfWorkPrisma;
    constructor(prismaProvider: PrismaProvider);
    private get prisma();
    private mapToDomain;
    create(review: Review): Promise<Review>;
    findById(id: number): Promise<Review | null>;
    findByPublicId(publicId: string): Promise<Review | null>;
    findByBookingId(bookingId: number): Promise<Review | null>;
    listByPartnerId(partnerId: number, limit?: number, offset?: number): Promise<Review[]>;
    update(review: Review): Promise<Review>;
    calculatePartnerRatingStats(partnerId: number): Promise<PartnerRatingStats>;
    updatePartnerProfileRatingStats(partnerId: number, stats: PartnerRatingStats): Promise<void>;
}
//# sourceMappingURL=PrismaReviewRepository.d.ts.map