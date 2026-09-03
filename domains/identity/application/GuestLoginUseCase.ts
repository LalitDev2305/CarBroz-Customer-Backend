import { IUseCase, IUserRepository, IUserSessionRepository } from '@carbroz/common';

interface Input {
  deviceId: string;
  deviceModel?: string;
  osVersion?: string;
  fcmToken?: string;
}

export class GuestLoginUseCase implements IUseCase<Input, any> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userSessionRepository: IUserSessionRepository
  ) {}

  async execute(input: Input): Promise<any> {
    const { deviceId, deviceModel, osVersion, fcmToken } = input;
    const guestUser = await this.userRepository.upsert(`guest_${Date.now()}`, {
      isGuest: true,
      role: 'GUEST',
    });

    const newSession = await this.userSessionRepository.upsert(guestUser.id, deviceId, {
      ...(deviceModel !== undefined ? { deviceModel } : {}),
      ...(osVersion !== undefined ? { osVersion } : {}),
      ...(fcmToken !== undefined ? { fcmToken } : {}),
    });

    return { user: guestUser, session: newSession };
  }
}
