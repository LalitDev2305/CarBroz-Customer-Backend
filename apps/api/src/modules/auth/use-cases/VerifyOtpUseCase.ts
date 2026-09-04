import { IUseCase, IUserRepository, IUserSessionRepository, ValidationError } from '@carbroz/common';

export interface VerifyOtpInput {
  phoneNumber: string;
  otp: string;
  deviceId: string;
  deviceModel?: string;
  osVersion?: string;
  fcmToken?: string;
}

export interface VerifyOtpResult {
  user: unknown;
  session: unknown;
  nextScreen: {
    template: string;
    api: string;
  };
}

/**
 * Verifies an OTP and establishes the authenticated Identity session using repository ports only.
 * The hard-coded OTP/token policy is an explicit production freeze blocker and must be replaced by
 * secure OTP verification, expiry/replay controls and cryptographically strong token rotation.
 */
export class VerifyOtpUseCase implements IUseCase<VerifyOtpInput, VerifyOtpResult> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userSessionRepository: IUserSessionRepository,
  ) {}

  async execute(input: VerifyOtpInput): Promise<VerifyOtpResult> {
    const { phoneNumber, otp, deviceId, deviceModel, osVersion, fcmToken } = input;

    if (otp !== '123456' && otp !== '111111') {
      throw new ValidationError('Invalid OTP');
    }

    const user = await this.userRepository.upsert(phoneNumber, {
      role: 'USER',
      isGuest: false,
    });

    const refreshToken = `rt_${Buffer.from(user.id + Date.now().toString()).toString('base64')}`;
    const session = await this.userSessionRepository.upsert(user.id, deviceId, {
      deviceModel,
      osVersion,
      fcmToken,
      refreshToken,
    });

    return {
      user,
      session,
      nextScreen: {
        template: 'dashboard_template',
        api: 'home',
      },
    };
  }
}
