import { PrismaClient } from '@prisma/client';
import { Booking, BookingStatus, IBookingRepository } from '@carbroz/common';

export class PrismaBookingRepository implements IBookingRepository {
  private unitOfWorkPrisma: any = null;

  constructor(private readonly prismaClient: PrismaClient) {}

  private get prisma() {
    return this.unitOfWorkPrisma || this.prismaClient;
  }

  private mapToDomain(record: any): Booking {
    return new Booking({
      id: record.id,
      publicId: record.publicId,
      customerId: record.customerId,
      partnerId: record.partnerId,
      vehicleId: record.vehicleId,
      addressId: record.addressId,
      serviceId: record.serviceId,
      status: record.status as BookingStatus,
      slotStartTime: record.slotStartTime,
      slotEndTime: record.slotEndTime,
      expiryAt: record.expiryAt,
      totalPricePaise: record.totalPricePaise,
      cancellationReason: record.cancellationReason,
      snapshots: record.snapshotsJson as any,
      statusHistory: record.statusHistoryJson as any,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  async create(booking: Booking): Promise<Booking> {
    const record = await this.prisma.booking.create({
      data: {
        customerId: booking.customerId,
        partnerId: booking.partnerId,
        vehicleId: booking.vehicleId,
        addressId: booking.addressId,
        serviceId: booking.serviceId,
        status: booking.status,
        slotStartTime: booking.slotStartTime,
        slotEndTime: booking.slotEndTime,
        expiryAt: booking.expiryAt,
        totalPricePaise: booking.totalPricePaise,
        cancellationReason: booking.cancellationReason,
        snapshotsJson: booking.snapshots as any,
        statusHistoryJson: booking.statusHistory as any,
      },
    });
    return this.mapToDomain(record);
  }

  async findById(id: number): Promise<Booking | null> {
    const record = await this.prisma.booking.findUnique({ where: { id } });
    return record ? this.mapToDomain(record) : null;
  }

  async findByPublicId(publicId: string): Promise<Booking | null> {
    const record = await this.prisma.booking.findUnique({ where: { publicId } });
    return record ? this.mapToDomain(record) : null;
  }

  async listByCustomerId(customerId: number, status?: BookingStatus): Promise<Booking[]> {
    const records = await this.prisma.booking.findMany({
      where: {
        customerId,
        status: status ? status : undefined,
      },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r) => this.mapToDomain(r));
  }

  async listByPartnerId(partnerId: number, status?: BookingStatus): Promise<Booking[]> {
    const records = await this.prisma.booking.findMany({
      where: {
        partnerId,
        status: status ? status : undefined,
      },
      orderBy: { slotStartTime: 'asc' },
    });
    return records.map((r) => this.mapToDomain(r));
  }

  async listAll(status?: BookingStatus, limit = 50, offset = 0): Promise<Booking[]> {
    const records = await this.prisma.booking.findMany({
      where: { status: status ? status : undefined },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r) => this.mapToDomain(r));
  }

  async findConflictingPartnerBooking(partnerId: number, startTime: Date, endTime: Date, excludeBookingId?: number): Promise<Booking | null> {
    const record = await this.prisma.booking.findFirst({
      where: {
        partnerId,
        id: excludeBookingId ? { not: excludeBookingId } : undefined,
        status: { in: ['ASSIGNED', 'IN_PROGRESS'] },
        OR: [
          {
            slotStartTime: { lte: startTime },
            slotEndTime: { gt: startTime },
          },
          {
            slotStartTime: { lt: endTime },
            slotEndTime: { gte: endTime },
          },
          {
            slotStartTime: { gte: startTime },
            slotEndTime: { lte: endTime },
          },
        ],
      },
    });
    return record ? this.mapToDomain(record) : null;
  }

  async findConflictingSlotBooking(serviceId: number, startTime: Date, endTime: Date): Promise<Booking | null> {
    const record = await this.prisma.booking.findFirst({
      where: {
        serviceId,
        status: { in: ['CREATED', 'CONFIRMED', 'ASSIGNED', 'IN_PROGRESS'] },
        slotStartTime: startTime,
        slotEndTime: endTime,
      },
    });
    return record ? this.mapToDomain(record) : null;
  }

  async findExpiredPendingBookings(now: Date): Promise<Booking[]> {
    const records = await this.prisma.booking.findMany({
      where: {
        status: 'CREATED',
        expiryAt: { lt: now },
      },
    });
    return records.map((r) => this.mapToDomain(r));
  }

  async update(booking: Booking): Promise<Booking> {
    const record = await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        partnerId: booking.partnerId,
        status: booking.status,
        expiryAt: booking.expiryAt,
        cancellationReason: booking.cancellationReason,
        snapshotsJson: booking.snapshots as any,
        statusHistoryJson: booking.statusHistory as any,
      },
    });
    return this.mapToDomain(record);
  }
}
