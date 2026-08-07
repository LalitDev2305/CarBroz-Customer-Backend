export interface PaymentWebhookProps {
  id?: number;
  publicId?: string;
  provider: string;
  eventId: string;
  eventType: string;
  payloadHash: string;
  processingStatus?: string;
  receivedAt?: Date;
  processedAt?: Date | null;
  failureReason?: string | null;
  retryCount?: number;
}

export class PaymentWebhook {
  id?: number;
  publicId?: string;
  provider: string;
  eventId: string;
  eventType: string;
  payloadHash: string;
  processingStatus: string;
  receivedAt: Date;
  processedAt: Date | null;
  failureReason: string | null;
  retryCount: number;

  constructor(props: PaymentWebhookProps) {
    if (!props.eventId) throw new Error('Webhook eventId is required');
    if (!props.eventType) throw new Error('Webhook eventType is required');

    this.id = props.id;
    this.publicId = props.publicId;
    this.provider = props.provider ?? 'RAZORPAY';
    this.eventId = props.eventId;
    this.eventType = props.eventType;
    this.payloadHash = props.payloadHash;
    this.processingStatus = props.processingStatus ?? 'PENDING';
    this.receivedAt = props.receivedAt ?? new Date();
    this.processedAt = props.processedAt ?? null;
    this.failureReason = props.failureReason ?? null;
    this.retryCount = props.retryCount ?? 0;
  }

  markProcessed(): void {
    this.processingStatus = 'PROCESSED';
    this.processedAt = new Date();
  }

  markFailed(reason: string): void {
    this.processingStatus = 'FAILED';
    this.failureReason = reason;
    this.retryCount += 1;
  }
}
