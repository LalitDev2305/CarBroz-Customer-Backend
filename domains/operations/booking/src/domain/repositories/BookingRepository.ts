import { Booking } from '../entities/Booking.js';
import { BookingStatus } from '../enums/BookingStatus.js';

export interface BookingRepository {
  findById(id: number): Promise<Booking | null>;
  listByCustomerId(customerId: number, status?: BookingStatus): Promise<Booking[]>;
  create(booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking>;
  update(booking: Booking): Promise<Booking>;
}
