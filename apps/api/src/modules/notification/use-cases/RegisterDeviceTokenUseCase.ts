import { DeviceToken, IDeviceTokenRepository } from '@carbroz/common';

export interface RegisterDeviceTokenInput {
  userId: number;
  deviceId: string;
  platform: 'ANDROID' | 'IOS' | 'WEB';
  token: string;
  appVersion?: string;
}

export class RegisterDeviceTokenUseCase {
  constructor(private readonly deviceTokenRepository: IDeviceTokenRepository) {}

  async execute(input: RegisterDeviceTokenInput): Promise<DeviceToken> {
    const deviceToken = new DeviceToken({
      userId: input.userId,
      deviceId: input.deviceId,
      platform: input.platform,
      token: input.token,
      appVersion: input.appVersion,
      isActive: true,
    });

    return await this.deviceTokenRepository.upsert(deviceToken);
  }
}
