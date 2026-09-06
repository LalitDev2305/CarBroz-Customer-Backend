import { DeviceToken } from '../../domain/DeviceToken.js';
import { IDeviceTokenRepository } from '../../domain/repositories/IDeviceTokenRepository.js';
/** RegisterDeviceTokenInput is an exported domains/communications contract/implementation; see the owning README for lifecycle and extension rules. */
export interface RegisterDeviceTokenInput {
  userId: number;
  deviceId: string;
  platform: 'ANDROID' | 'IOS' | 'WEB';
  token: string;
  appVersion?: string;
}

/** RegisterDeviceTokenUseCase is an exported domains/communications contract/implementation; see the owning README for lifecycle and extension rules. */
export class RegisterDeviceTokenUseCase {
  constructor(private readonly deviceTokenRepository: IDeviceTokenRepository) {}

  /** Executes this application operation through its declared ports and domain invariants. */
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
