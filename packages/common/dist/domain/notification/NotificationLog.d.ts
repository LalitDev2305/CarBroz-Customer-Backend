import { NotificationChannel } from './NotificationChannel.js';
import { NotificationStatus } from './NotificationStatus.js';
export interface NotificationLogProps {
    id?: number;
    publicId?: string;
    bookingId?: number | null;
    recipientId: number;
    channel: NotificationChannel;
    provider: string;
    templateId: string;
    providerReference?: string | null;
    recipient: string;
    status?: NotificationStatus;
    errorCode?: string | null;
    sentAt?: Date;
    createdAt?: Date;
}
export declare class NotificationLog {
    id?: number;
    publicId?: string;
    bookingId: number | null;
    recipientId: number;
    channel: NotificationChannel;
    provider: string;
    templateId: string;
    providerReference: string | null;
    recipient: string;
    status: NotificationStatus;
    errorCode: string | null;
    sentAt: Date;
    createdAt?: Date;
    constructor(props: NotificationLogProps);
}
