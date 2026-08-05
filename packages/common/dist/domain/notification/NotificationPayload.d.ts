import { NotificationChannel } from './NotificationChannel.js';
export interface NotificationPayloadProps {
    channel: NotificationChannel;
    templateId: string;
    recipient: string;
    recipientId: number;
    bookingId?: number | null;
    title?: string;
    body?: string;
    data?: Record<string, any>;
}
export declare class NotificationPayload {
    readonly channel: NotificationChannel;
    readonly templateId: string;
    readonly recipient: string;
    readonly recipientId: number;
    readonly bookingId: number | null;
    readonly title: string;
    readonly body: string;
    readonly data: Record<string, any>;
    constructor(props: NotificationPayloadProps);
}
