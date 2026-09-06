import type { TransactionContext } from "@carbroz/foundation-kernel";
import type { Booking } from "../Booking.js";
import type { BookingStatus } from "../BookingStatus.js";

/** Canonical Booking persistence contract exposed through the Booking public boundary. */
export interface IBookingRepository {
  create(booking: Booking, transaction?: TransactionContext): Promise<Booking>;
  findById(
    id: number,
    transaction?: TransactionContext,
  ): Promise<Booking | null>;
  findByPublicId(
    publicId: string,
    transaction?: TransactionContext,
  ): Promise<Booking | null>;
  listByCustomerId(
    customerId: number,
    status?: BookingStatus,
    transaction?: TransactionContext,
  ): Promise<Booking[]>;
  listByPartnerId(
    partnerId: number,
    status?: BookingStatus,
    transaction?: TransactionContext,
  ): Promise<Booking[]>;
  listByCorporateAccountId(
    corporateAccountId: number,
    status?: BookingStatus,
    transaction?: TransactionContext,
  ): Promise<Booking[]>;
  listAll(
    status?: BookingStatus,
    limit?: number,
    offset?: number,
    transaction?: TransactionContext,
  ): Promise<Booking[]>;
  findConflictingPartnerBooking(
    partnerId: number,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: number,
    transaction?: TransactionContext,
  ): Promise<Booking | null>;
  findConflictingSlotBooking(
    serviceId: number,
    startTime: Date,
    endTime: Date,
    transaction?: TransactionContext,
  ): Promise<Booking | null>;
  findExpiredPendingBookings(
    now: Date,
    transaction?: TransactionContext,
  ): Promise<Booking[]>;
  update(booking: Booking, transaction?: TransactionContext): Promise<Booking>;
}
