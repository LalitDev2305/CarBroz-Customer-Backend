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

export class NotificationLog {
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

  constructor(props: NotificationLogProps) {
    if (!props.recipientId) throw new Error('NotificationLog must be associated with a recipientId');
    if (!props.recipient) throw new Error('NotificationLog recipient is required');
    if (!props.templateId) throw new Error('NotificationLog templateId is required');

    this.id = props.id;
    this.publicId = props.publicId;
    this.bookingId = props.bookingId ?? null;
    this.recipientId = props.recipientId;
    this.channel = props.channel;
    this.provider = props.provider;
    this.templateId = props.templateId;
    this.providerReference = props.providerReference ?? null;
    this.recipient = props.recipient;
    this.status = props.status ?? 'SENT';
    this.errorCode = props.errorCode ?? null;
    this.sentAt = props.sentAt ?? new Date();
    this.createdAt = props.createdAt;
  }
}
