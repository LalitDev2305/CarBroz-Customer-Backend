import { IDeviceTokenRepository } from '../../domain/repositories/IDeviceTokenRepository.js';
/** DeactivateDeviceTokenInput is an exported domains/communications contract/implementation; see the owning README for lifecycle and extension rules. */
export interface DeactivateDeviceTokenInput {
  userId: number;
  deviceId: string;
}

/** DeactivateDeviceTokenUseCase is an exported domains/communications contract/implementation; see the owning README for lifecycle and extension rules. */
export class DeactivateDeviceTokenUseCase {
  constructor(private readonly deviceTokenRepository: IDeviceTokenRepository) {}

  /** Executes this application operation through its declared ports and domain invariants. */
  async execute(input: DeactivateDeviceTokenInput): Promise<void> {
    await this.deviceTokenRepository.deactivate(input.userId, input.deviceId);
  }
}
