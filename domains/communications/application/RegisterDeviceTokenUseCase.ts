import { DeviceToken } from '../domain/DeviceToken.js';
import { PrismaDeviceTokenRepository } from '../infrastructure/repositories/PrismaDeviceTokenRepository.js';

export interface RegisterTokenInput {
  userId: number;
  deviceId: string;
  token: string;
  platform: 'ANDROID' | 'IOS' | 'WEB';
  appVersion?: string;
}

export class RegisterDeviceTokenUseCase {
  constructor(private readonly tokenRepository: PrismaDeviceTokenRepository) {}

  public async execute(input: RegisterTokenInput): Promise<DeviceToken> {
    const token = new DeviceToken({
      userId: input.userId,
      deviceId: input.deviceId,
      token: input.token,
      platform: input.platform,
      appVersion: input.appVersion || null,
      isActive: true,
      lastSeenAt: new Date(),
    });

    return this.tokenRepository.upsert(token);
  }
}
