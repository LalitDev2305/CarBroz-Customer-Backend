import { PrismaClient } from '@prisma/client';
import { Dispute, DisputeStatus, IDisputeRepository } from '@carbroz/common';
export declare class PrismaDisputeRepository implements IDisputeRepository {
    private readonly prismaClient;
    private unitOfWorkPrisma;
    constructor(prismaClient: PrismaClient);
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
//# sourceMappingURL=PrismaDisputeRepository.d.ts.map