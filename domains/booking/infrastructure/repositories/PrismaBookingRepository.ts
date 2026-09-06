import type { TransactionContext } from "@carbroz/foundation-kernel";
import { Booking } from "../../domain/Booking.js";
import type { BookingStatus } from "../../domain/BookingStatus.js";
import type { IBookingRepository } from "../../domain/repositories/IBookingRepository.js";
import type {
  BookingPersistenceClient,
  BookingPersistenceRecord,
} from "../persistence/BookingPersistenceClient.js";

/** PrismaBookingRepository is the Booking-owned persistence adapter. */
export class PrismaBookingRepository implements IBookingRepository {
  constructor(private readonly prisma: BookingPersistenceClient) {}

  private client(transaction?: TransactionContext): BookingPersistenceClient {
    return transaction
      ? (transaction.resource as BookingPersistenceClient)
      : this.prisma;
  }

  private mapToDomain(record: BookingPersistenceRecord): Booking {
    return new Booking({
      id: record.id,
      publicId: record.publicId,
      customerId: record.customerId,
      partnerId: record.partnerId ?? undefined,
      vehicleId: record.vehicleId,
      addressId: record.addressId,
      serviceId: record.serviceId,
      status: record.status as BookingStatus,
      slotStartTime: record.slotStartTime,
      slotEndTime: record.slotEndTime,
      expiryAt: record.expiryAt ?? undefined,
      totalPricePaise: record.totalPricePaise,
      cancellationReason: record.cancellationReason ?? undefined,
      snapshots: record.snapshotsJson as Booking["snapshots"],
      statusHistory: record.statusHistoryJson as Booking["statusHistory"],
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  async create(
    booking: Booking,
    transaction?: TransactionContext,
  ): Promise<Booking> {
    const record = await this.client(transaction).booking.create({
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
        snapshotsJson: booking.snapshots,
        statusHistoryJson: booking.statusHistory,
      },
    });
    return this.mapToDomain(record);
  }

  async findById(
    id: number,
    transaction?: TransactionContext,
  ): Promise<Booking | null> {
    const record = await this.client(transaction).booking.findUnique({
      where: { id },
    });
    return record ? this.mapToDomain(record) : null;
  }

  async findByPublicId(
    publicId: string,
    transaction?: TransactionContext,
  ): Promise<Booking | null> {
    const record = await this.client(transaction).booking.findUnique({
      where: { publicId },
    });
    return record ? this.mapToDomain(record) : null;
  }

  async listByCustomerId(
    customerId: number,
    status?: BookingStatus,
    transaction?: TransactionContext,
  ): Promise<Booking[]> {
    const records = await this.client(transaction).booking.findMany({
      where: { customerId, status: status || undefined },
      orderBy: { createdAt: "desc" },
    });
    return records.map((record) => this.mapToDomain(record));
  }

  async listByPartnerId(
    partnerId: number,
    status?: BookingStatus,
    transaction?: TransactionContext,
  ): Promise<Booking[]> {
    const records = await this.client(transaction).booking.findMany({
      where: { partnerId, status: status || undefined },
      orderBy: { slotStartTime: "asc" },
    });
    return records.map((record) => this.mapToDomain(record));
  }

  async listByCorporateAccountId(
    corporateAccountId: number,
    status?: BookingStatus,
    transaction?: TransactionContext,
  ): Promise<Booking[]> {
    const records = await this.client(transaction).booking.findMany({
      where: { corporateAccountId, status: status || undefined },
      orderBy: { createdAt: "asc" },
    });
    return records.map((record) => this.mapToDomain(record));
  }

  async listAll(
    status?: BookingStatus,
    limit = 50,
    offset = 0,
    transaction?: TransactionContext,
  ): Promise<Booking[]> {
    const records = await this.client(transaction).booking.findMany({
      where: { status: status || undefined },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });
    return records.map((record) => this.mapToDomain(record));
  }

  async findConflictingPartnerBooking(
    partnerId: number,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: number,
    transaction?: TransactionContext,
  ): Promise<Booking | null> {
    const record = await this.client(transaction).booking.findFirst({
      where: {
        partnerId,
        id: excludeBookingId ? { not: excludeBookingId } : undefined,
        status: { in: ["ASSIGNED", "IN_PROGRESS"] },
        OR: [
          { slotStartTime: { lte: startTime }, slotEndTime: { gt: startTime } },
          { slotStartTime: { lt: endTime }, slotEndTime: { gte: endTime } },
          { slotStartTime: { gte: startTime }, slotEndTime: { lte: endTime } },
        ],
      },
    });
    return record ? this.mapToDomain(record) : null;
  }

  async findConflictingSlotBooking(
    serviceId: number,
    startTime: Date,
    endTime: Date,
    transaction?: TransactionContext,
  ): Promise<Booking | null> {
    const record = await this.client(transaction).booking.findFirst({
      where: {
        serviceId,
        status: { in: ["CREATED", "CONFIRMED", "ASSIGNED", "IN_PROGRESS"] },
        slotStartTime: startTime,
        slotEndTime: endTime,
      },
    });
    return record ? this.mapToDomain(record) : null;
  }

  async findExpiredPendingBookings(
    now: Date,
    transaction?: TransactionContext,
  ): Promise<Booking[]> {
    const records = await this.client(transaction).booking.findMany({
      where: { status: "CREATED", expiryAt: { lt: now } },
    });
    return records.map((record) => this.mapToDomain(record));
  }

  async update(
    booking: Booking,
    transaction?: TransactionContext,
  ): Promise<Booking> {
    const record = await this.client(transaction).booking.update({
      where: { id: booking.id },
      data: {
        partnerId: booking.partnerId,
        status: booking.status,
        expiryAt: booking.expiryAt,
        cancellationReason: booking.cancellationReason,
        snapshotsJson: booking.snapshots,
        statusHistoryJson: booking.statusHistory,
      },
    });
    return this.mapToDomain(record);
  }
}
