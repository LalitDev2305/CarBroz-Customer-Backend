import { PrismaProvider } from '@carbroz/platform-database';
import { Dispute } from '../../../domain/entities/Dispute.js';
import { DisputeStatus } from '../../../domain/enums/DisputeStatus.js';
export declare class PrismaDisputeRepository {
    private readonly prismaProvider;
    private unitOfWorkPrisma;
    constructor(prismaProvider: PrismaProvider);
    private get prisma();
    private mapToDomain;
    create(dispute: Dispute): Promise<Dispute>;
    update(dispute: Dispute): Promise<Dispute>;
    findById(id: number): Promise<Dispute | null>;
    findByPublicId(publicId: string): Promise<Dispute | null>;
    findActiveByBookingId(bookingId: number): Promise<Dispute | null>;
    listByBookingId(bookingId: number): Promise<Dispute[]>;
    list(status?: DisputeStatus, limit?: number, offset?: number): Promise<Dispute[]>;
}
