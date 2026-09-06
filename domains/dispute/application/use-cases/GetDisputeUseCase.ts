import { DomainError } from "@carbroz/foundation-kernel";
import { Dispute } from "../../domain/Dispute.js";
import { IDisputeRepository } from "../../domain/repositories/IDisputeRepository.js";
import { ErrorCode } from "@carbroz/foundation-kernel";
/** GetDisputeUseCase is an exported domains/dispute contract/implementation; see the owning README for lifecycle and extension rules. */
export class GetDisputeUseCase {
  constructor(private readonly disputeRepository: IDisputeRepository) {}

  /** Executes this application operation through its declared ports and domain invariants. */
  async execute(publicId: string): Promise<Dispute> {
    const dispute = await this.disputeRepository.findByPublicId(publicId);
    if (!dispute) {
      throw new DomainError(ErrorCode.RESOURCE_NOT_FOUND);
    }
    return dispute;
  }
}
