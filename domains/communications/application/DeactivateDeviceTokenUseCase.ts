import { type IDeviceTokenRepository } from '../domain/repositories/IDeviceTokenRepository.js';

export interface DeactivateDeviceTokenInput {
  userId: number;
  deviceId: string;
}

export class DeactivateDeviceTokenUseCase {
  constructor(private readonly deviceTokenRepository: IDeviceTokenRepository) {}

  async execute(input: DeactivateDeviceTokenInput): Promise<void> {
    await this.deviceTokenRepository.deactivate(input.userId, input.deviceId);
  }
}
