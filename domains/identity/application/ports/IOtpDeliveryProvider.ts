export interface OtpDeliveryInput {
  phoneNumber: string;
  otp: string;
}

export interface OtpDeliveryResult {
  success: boolean;
  providerReference?: string;
  errorCode?: string;
}

export interface IOtpDeliveryProvider {
  sendOtp(input: OtpDeliveryInput): Promise<OtpDeliveryResult>;
}
