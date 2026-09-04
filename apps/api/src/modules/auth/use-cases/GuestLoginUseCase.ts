import { IUseCase, IUserRepository, IUserSessionRepository } from '@carbroz/common';

export interface GuestLoginInput {
  deviceId: string;
  deviceModel?: string;
  osVersion?: string;
  fcmToken?: string;
}

export interface GuestLoginResult {
  user: unknown;
  session: unknown;
}

/**
 * Creates a guest identity and device session without depending on HTTP/Zod transport schemas.
 * Guest identity/session persistence remains behind Identity repository contracts.
 */
export class GuestLoginUseCase implements IUseCase<GuestLoginInput, GuestLoginResult> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userSessionRepository: IUserSessionRepository,
  ) {}

  async execute(input: GuestLoginInput): Promise<GuestLoginResult> {
    const { deviceId, deviceModel, osVersion, fcmToken } = input;
    const guestUser = await this.userRepository.upsert(`guest_${Date.now()}`, {
      isGuest: true,
      role: 'GUEST',
    });

    const session = await this.userSessionRepository.upsert(guestUser.id, deviceId, {
      deviceModel,
      osVersion,
      fcmToken,
    });

    return { user: guestUser, session };
  }
}
