import { IUseCase, IUserRepository, IUserSessionRepository, ValidationError } from '@carbroz/common';
import { z } from 'zod';
import { VerifyOtpSchema } from '../dtos/auth.dto.js';

type Input = z.infer<typeof VerifyOtpSchema>;

export class VerifyOtpUseCase implements IUseCase<Input, any> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userSessionRepository: IUserSessionRepository
  ) {}

  async execute(input: Input): Promise<any> {
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
        api: 'home'
      }
    };
  }
}
