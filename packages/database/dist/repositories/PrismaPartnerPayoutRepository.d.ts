import { PrismaClient } from '@prisma/client';
import { IPartnerPayoutRepository, PartnerPayout, PayoutStatus } from '@carbroz/common';
export declare class PrismaPartnerPayoutRepository implements IPartnerPayoutRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    private mapToDomain;
    create(payout: PartnerPayout): Promise<PartnerPayout>;
    findById(id: number): Promise<PartnerPayout | null>;
    findByPublicId(publicId: string): Promise<PartnerPayout | null>;
    findByBookingId(bookingId: number): Promise<PartnerPayout | null>;
    listByPartnerId(partnerId: number, status?: PayoutStatus): Promise<PartnerPayout[]>;
    listByStatus(status: PayoutStatus, limit?: number, offset?: number): Promise<PartnerPayout[]>;
    update(payout: PartnerPayout): Promise<PartnerPayout>;
}
