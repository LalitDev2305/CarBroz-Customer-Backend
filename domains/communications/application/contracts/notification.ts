/**
 * Transport-neutral application input contracts derived from notification.dto.ts.
 * Zod remains at the API boundary; bounded-context application services depend only on these types.
 */
export type RegisterDeviceTokenDto = { deviceId: string; platform: "ANDROID" | "IOS" | "WEB"; token: string; appVersion?: string | undefined; };
/** DeactivateDeviceTokenDto is an exported domains/communications contract/implementation; see the owning README for lifecycle and extension rules. */
export type DeactivateDeviceTokenDto = { deviceId: string; };
/** SendNotificationDto is an exported domains/communications contract/implementation; see the owning README for lifecycle and extension rules. */
export type SendNotificationDto = { channel: "PUSH" | "SMS" | "EMAIL"; templateId: string; recipient: string; recipientId: number; bookingId?: number | undefined; title?: string | undefined; body?: string | undefined; data?: Record<string, any> | undefined; };
