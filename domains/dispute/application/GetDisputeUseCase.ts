import { Dispute } from '../domain/Dispute.js';
import { type IDisputeRepository } from '../domain/repositories/IDisputeRepository.js';
import { ErrorCode } from '@carbroz/foundation-kernel';

export class GetDisputeUseCase {
  constructor(private readonly disputeRepository: IDisputeRepository) {}

  async execute(publicId: string): Promise<Dispute> {
    const dispute = await this.disputeRepository.findByPublicId(publicId);
    if (!dispute) {
      throw new Error(ErrorCode.RESOURCE_NOT_FOUND);
    }
    return dispute;
  }
}
