import { ReviewStatus } from './ReviewStatus.js';

export interface ReviewProps {
  id?: number;
  publicId?: string;
  bookingId: number;
  customerId: number;
  partnerId: number;
  serviceId: number;
  rating: number;
  comment?: string | null;
  status?: ReviewStatus;
  moderationReason?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Review {
  id?: number;
  publicId?: string;
  bookingId: number;
  customerId: number;
  partnerId: number;
  serviceId: number;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  moderationReason: string | null;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: ReviewProps) {
    if (!props.bookingId) throw new Error('Review must be associated with a bookingId');
    if (!props.customerId) throw new Error('Review must be associated with a customerId');
    if (!props.partnerId) throw new Error('Review must be associated with a partnerId');
    if (!props.serviceId) throw new Error('Review must be associated with a serviceId');
    if (props.rating < 1 || props.rating > 5 || !Number.isInteger(props.rating)) {
      throw new Error(`Review rating must be an integer between 1 and 5 (got ${props.rating})`);
    }

    this.id = props.id;
    this.publicId = props.publicId;
    this.bookingId = props.bookingId;
    this.customerId = props.customerId;
    this.partnerId = props.partnerId;
    this.serviceId = props.serviceId;
    this.rating = props.rating;
    this.comment = props.comment ?? null;
    this.status = props.status ?? 'PUBLISHED';
    this.moderationReason = props.moderationReason ?? null;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  moderate(newStatus: ReviewStatus, reason?: string): void {
    this.status = newStatus;
    if (reason) {
      this.moderationReason = reason;
    }
  }
}
