import type { IDeviceTokenRepository } from '@carbroz/common';

export interface UnregisterTokenInput {
  userId: number;
  deviceId: string;
}

/**
 * Deactivates a registered device token through the Communications repository port.
 *
 * Application orchestration depends on the repository contract rather than a Prisma adapter so
 * persistence technology can change without changing this use case.
 */
export class UnregisterDeviceTokenUseCase {
  constructor(private readonly tokenRepository: IDeviceTokenRepository) {}

  public async execute(input: UnregisterTokenInput): Promise<void> {
    await this.tokenRepository.deactivate(input.userId, input.deviceId);
  }
}
