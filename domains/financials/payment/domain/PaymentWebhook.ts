import { DomainError, systemClock } from "@carbroz/foundation-kernel";
/** PaymentWebhookProps is an exported domains/financials contract/implementation; see the owning README for lifecycle and extension rules. */
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

/** PaymentWebhook is an exported domains/financials contract/implementation; see the owning README for lifecycle and extension rules. */
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
    if (!props.eventId) throw new DomainError("Webhook eventId is required");
    if (!props.eventType)
      throw new DomainError("Webhook eventType is required");

    this.id = props.id;
    this.publicId = props.publicId;
    this.provider = props.provider ?? "RAZORPAY";
    this.eventId = props.eventId;
    this.eventType = props.eventType;
    this.payloadHash = props.payloadHash;
    this.processingStatus = props.processingStatus ?? "PENDING";
    this.receivedAt = props.receivedAt ?? systemClock.now();
    this.processedAt = props.processedAt ?? null;
    this.failureReason = props.failureReason ?? null;
    this.retryCount = props.retryCount ?? 0;
  }

  markProcessed(): void {
    this.processingStatus = "PROCESSED";
    this.processedAt = systemClock.now();
  }

  markFailed(reason: string): void {
    this.processingStatus = "FAILED";
    this.failureReason = reason;
    this.retryCount += 1;
  }
}
