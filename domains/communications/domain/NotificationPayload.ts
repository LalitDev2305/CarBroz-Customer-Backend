import { type NotificationChannel } from './NotificationChannel.js';

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

export class NotificationPayload {
  readonly channel: NotificationChannel;
  readonly templateId: string;
  readonly recipient: string;
  readonly recipientId: number;
  readonly bookingId: number | null;
  readonly title: string;
  readonly body: string;
  readonly data: Record<string, any>;

  constructor(props: NotificationPayloadProps) {
    if (!props.templateId) throw new Error('Notification templateId is required');
    if (!props.recipient) throw new Error('Notification recipient destination is required');
    if (!props.recipientId) throw new Error('Notification recipientId is required');

    this.channel = props.channel;
    this.templateId = props.templateId;
    this.recipient = props.recipient;
    this.recipientId = props.recipientId;
    this.bookingId = props.bookingId ?? null;
    this.title = props.title ?? '';
    this.body = props.body ?? '';
    this.data = props.data ?? {};
  }
}
