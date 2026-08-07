import { PrismaDeviceTokenRepository } from '../infrastructure/repositories/PrismaDeviceTokenRepository.js';

export interface UnregisterTokenInput {
  userId: number;
  deviceId: string;
}

export class UnregisterDeviceTokenUseCase {
  constructor(private readonly tokenRepository: PrismaDeviceTokenRepository) {}

  public async execute(input: UnregisterTokenInput): Promise<void> {
    await this.tokenRepository.deactivate(input.userId, input.deviceId);
  }
}
