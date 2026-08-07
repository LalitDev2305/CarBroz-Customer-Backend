import { IUseCase, IUserRepository } from '@carbroz/common';
import { z } from 'zod';
import { SendOtpSchema } from '../dtos/auth.dto.js';

type Input = z.infer<typeof SendOtpSchema>;

export class SendOtpUseCase implements IUseCase<Input, any> {
  constructor(
    private readonly userRepository: IUserRepository
  ) {}

  async execute(input: Input): Promise<any> {
    const { phoneNumber } = input;
    
    const user = await this.userRepository.findByPhoneNumber(phoneNumber);
    const isNewUser = !user;

    const mockOtp = '123456';
    
    return {
      message: 'OTP sent successfully',
      mockOtp,
      isNewUser,
      nextScreen: {
        template: 'form_template',
        api: 'auth/auth_otp'
      }
    };
  }
}
