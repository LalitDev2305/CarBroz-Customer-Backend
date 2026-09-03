import { Dispute } from '../domain/Dispute.js';
import { type DisputeStatus } from '../domain/DisputeStatus.js';
import { type IDisputeRepository } from '../domain/repositories/IDisputeRepository.js';

export class ListDisputesUseCase {
  constructor(private readonly disputeRepository: IDisputeRepository) {}

  async execute(status?: DisputeStatus, limit?: number, offset?: number): Promise<Dispute[]> {
    return await this.disputeRepository.list(status, limit, offset);
  }
}
