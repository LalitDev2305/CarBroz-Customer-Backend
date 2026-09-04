import { IUseCase, IUserRepository } from '@carbroz/common';

export interface SendOtpInput {
  phoneNumber: string;
}

export interface SendOtpResult {
  message: string;
  mockOtp: string;
  isNewUser: boolean;
  nextScreen: {
    template: string;
    api: string;
  };
}

/**
 * Starts the OTP authentication flow without depending on HTTP/Zod transport schemas.
 *
 * The current mock OTP response is intentionally retained only as an explicit freeze blocker; it
 * must be replaced by a secure OTP provider/persistence/expiry policy before production closeout.
 */
export class SendOtpUseCase implements IUseCase<SendOtpInput, SendOtpResult> {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: SendOtpInput): Promise<SendOtpResult> {
    const user = await this.userRepository.findByPhoneNumber(input.phoneNumber);
    const isNewUser = !user;
    const mockOtp = '123456';

    return {
      message: 'OTP sent successfully',
      mockOtp,
      isNewUser,
      nextScreen: {
        template: 'form_template',
        api: 'auth/auth_otp',
      },
    };
  }
}
