import { type IUseCase } from '@carbroz/foundation-kernel';
import { type IUserRepository } from '../domain/repositories/IUserRepository.js';

interface Input {
  phoneNumber: string;
  deviceId: string;
}

export class SendOtpUseCase implements IUseCase<Input, any> {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: Input): Promise<any> {
    const { phoneNumber } = input;
    const user = await this.userRepository.findByPhoneNumber(phoneNumber);

    return {
      message: 'OTP sent successfully',
      mockOtp: '123456',
      isNewUser: !user,
    };
  }
}
