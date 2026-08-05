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
export declare class Review {
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
    constructor(props: ReviewProps);
    moderate(newStatus: ReviewStatus, reason?: string): void;
}
