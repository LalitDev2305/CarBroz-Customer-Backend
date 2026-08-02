import { IUseCase, IUserRepository, IUserSessionRepository } from '@carbroz/common';
import { z } from 'zod';
import { GuestLoginSchema } from '../dtos/auth.dto.js';

type Input = z.infer<typeof GuestLoginSchema>;

export class GuestLoginUseCase implements IUseCase<Input, any> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userSessionRepository: IUserSessionRepository
  ) {}

  async execute(input: Input): Promise<any> {
    const { deviceId, deviceModel, osVersion, fcmToken } = input;

    // Check if a guest user already exists for this device ID via session
    // let session = await this.userSessionRepository.findByDevice(0, deviceId); 
    // Actually, Guest means the user has `isGuest: true`.
    // Wait, if they reinstall, they get a new guest user. That's fine for guests.
    
    // Create guest user
    const guestUser = await this.userRepository.upsert(`guest_${Date.now()}`, {
      isGuest: true,
      role: 'GUEST',
    });

    // Create session for guest
    const newSession = await this.userSessionRepository.upsert(guestUser.id, deviceId, {
      deviceModel,
      osVersion,
      fcmToken,
    });

    return {
      user: guestUser,
      session: newSession,
    };
  }
}
