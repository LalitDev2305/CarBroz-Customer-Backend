import { Dispute } from '../../domain/Dispute.js';
import { DisputeStatus } from '../../domain/DisputeStatus.js';
import { IDisputeRepository } from '../../domain/repositories/IDisputeRepository.js';
/** ListDisputesUseCase is an exported domains/dispute contract/implementation; see the owning README for lifecycle and extension rules. */
export class ListDisputesUseCase {
  constructor(private readonly disputeRepository: IDisputeRepository) {}

  /** Executes this application operation through its declared ports and domain invariants. */
  async execute(status?: DisputeStatus, limit?: number, offset?: number): Promise<Dispute[]> {
    return await this.disputeRepository.list(status, limit, offset);
  }
}
