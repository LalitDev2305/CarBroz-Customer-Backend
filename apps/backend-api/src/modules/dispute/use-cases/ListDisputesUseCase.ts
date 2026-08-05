import { Dispute, DisputeStatus, IDisputeRepository } from '@carbroz/common';

export class ListDisputesUseCase {
  constructor(private readonly disputeRepository: IDisputeRepository) {}

  async execute(status?: DisputeStatus, limit?: number, offset?: number): Promise<Dispute[]> {
    return await this.disputeRepository.list(status, limit, offset);
  }
}
