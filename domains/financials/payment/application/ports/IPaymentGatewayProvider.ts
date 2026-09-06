/** CreatePaymentOrderInput is an exported domains/financials contract/implementation; see the owning README for lifecycle and extension rules. */
export interface CreatePaymentOrderInput {
  bookingPublicId: string;
  amountPaise: number;
  currency: string;
  idempotencyKey: string;
}

/** PaymentOrderResult is an exported domains/financials contract/implementation; see the owning README for lifecycle and extension rules. */
export interface PaymentOrderResult {
  providerOrderId: string;
  amountPaise: number;
  currency: string;
  keyId?: string;
}

/** WebhookEventPayload is an exported domains/financials contract/implementation; see the owning README for lifecycle and extension rules. */
export interface WebhookEventPayload {
  provider: string;
  eventId: string;
  eventType: string;
  providerOrderId?: string;
  providerPaymentId?: string;
  amountPaise?: number;
  status?: string;
  failureCode?: string;
  failureReason?: string;
  rawBody: string;
}

/** IPaymentGatewayProvider is an exported domains/financials contract/implementation; see the owning README for lifecycle and extension rules. */
export interface IPaymentGatewayProvider {
  createOrder(input: CreatePaymentOrderInput): Promise<PaymentOrderResult>;
  verifyWebhookSignature(rawBodyBuffer: Buffer, signature: string, secret: string): boolean;
  parseWebhookEvent(rawBodyString: string): WebhookEventPayload;
}
