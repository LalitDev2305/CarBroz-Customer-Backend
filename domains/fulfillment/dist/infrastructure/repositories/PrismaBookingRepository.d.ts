import { PrismaProvider } from '@carbroz/platform-database';
import { Booking } from '../../domain/Booking.js';
import { BookingStatus } from '../../domain/BookingStatus.js';
export declare class PrismaBookingRepository {
    private readonly prismaProvider;
    private unitOfWorkPrisma;
    constructor(prismaProvider: PrismaProvider);
    private get prisma();
    private mapToDomain;
    create(booking: Booking): Promise<Booking>;
    findById(id: number): Promise<Booking | null>;
    findByPublicId(publicId: string): Promise<Booking | null>;
    listByCustomerId(customerId: number, status?: BookingStatus): Promise<Booking[]>;
    listByPartnerId(partnerId: number, status?: BookingStatus): Promise<Booking[]>;
    listAll(status?: BookingStatus, limit?: number, offset?: number): Promise<Booking[]>;
    findConflictingPartnerBooking(partnerId: number, startTime: Date, endTime: Date, excludeBookingId?: number): Promise<Booking | null>;
    findConflictingSlotBooking(serviceId: number, startTime: Date, endTime: Date): Promise<Booking | null>;
    findExpiredPendingBookings(now: Date): Promise<Booking[]>;
    update(booking: Booking): Promise<Booking>;
}
//# sourceMappingURL=PrismaBookingRepository.d.ts.map