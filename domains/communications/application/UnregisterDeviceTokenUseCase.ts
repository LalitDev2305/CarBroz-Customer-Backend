import type { IDeviceTokenRepository } from '../domain/repositories/IDeviceTokenRepository.js';

export interface UnregisterTokenInput {
  userId: number;
  deviceId: string;
}

/** Deactivates one device token through the Communications repository port. */
export class UnregisterDeviceTokenUseCase {
  constructor(private readonly tokenRepository: IDeviceTokenRepository) {}

  async execute(input: UnregisterTokenInput): Promise<void> {
    await this.tokenRepository.deactivate(input.userId, input.deviceId);
  }
}
