import { Dispute, ErrorCode, IDisputeRepository } from '@carbroz/common';

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
