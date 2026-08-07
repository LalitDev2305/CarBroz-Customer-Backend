import { PrismaProvider } from '@carbroz/platform-database';
import { PartnerPayout } from '../../../domain/entities/PartnerPayout.js';
import { PayoutStatus } from '../../../domain/enums/PayoutStatus.js';
export declare class PrismaPartnerPayoutRepository {
    private readonly prismaProvider;
    private unitOfWorkPrisma;
    constructor(prismaProvider: PrismaProvider);
    private get prisma();
    private mapToDomain;
    create(payout: PartnerPayout): Promise<PartnerPayout>;
    findById(id: number): Promise<PartnerPayout | null>;
    findByPublicId(publicId: string): Promise<PartnerPayout | null>;
    findByBookingId(bookingId: number): Promise<PartnerPayout | null>;
    listByPartnerId(partnerId: number, status?: PayoutStatus): Promise<PartnerPayout[]>;
    listByStatus(status: PayoutStatus, limit?: number, offset?: number): Promise<PartnerPayout[]>;
    update(payout: PartnerPayout): Promise<PartnerPayout>;
}
