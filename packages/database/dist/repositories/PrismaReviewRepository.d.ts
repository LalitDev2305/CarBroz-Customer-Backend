import { PrismaClient } from '@prisma/client';
import { IReviewRepository, PartnerRatingStats, Review } from '@carbroz/common';
export declare class PrismaReviewRepository implements IReviewRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
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
