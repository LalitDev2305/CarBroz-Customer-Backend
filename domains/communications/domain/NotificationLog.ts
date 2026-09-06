import { DomainError, systemClock } from "@carbroz/foundation-kernel";
import { NotificationChannel } from "./NotificationChannel.js";
import { NotificationStatus } from "./NotificationStatus.js";

/** NotificationLogProps is an exported domains/communications contract/implementation; see the owning README for lifecycle and extension rules. */
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

/** NotificationLog is an exported domains/communications contract/implementation; see the owning README for lifecycle and extension rules. */
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
    if (!props.recipientId)
      throw new DomainError(
        "NotificationLog must be associated with a recipientId",
      );
    if (!props.recipient)
      throw new DomainError("NotificationLog recipient is required");
    if (!props.templateId)
      throw new DomainError("NotificationLog templateId is required");

    this.id = props.id;
    this.publicId = props.publicId;
    this.bookingId = props.bookingId ?? null;
    this.recipientId = props.recipientId;
    this.channel = props.channel;
    this.provider = props.provider;
    this.templateId = props.templateId;
    this.providerReference = props.providerReference ?? null;
    this.recipient = props.recipient;
    this.status = props.status ?? "SENT";
    this.errorCode = props.errorCode ?? null;
    this.sentAt = props.sentAt ?? systemClock.now();
    this.createdAt = props.createdAt;
  }
}
