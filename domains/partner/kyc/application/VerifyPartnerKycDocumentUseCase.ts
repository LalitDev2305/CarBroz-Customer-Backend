import { DomainError } from "@carbroz/foundation-kernel";
import { KycDocument } from "../domain/KycDocument.js";
import { KycDocumentStatus } from "../domain/KycDocumentStatus.js";
import type { IKycDocumentRepository } from "../domain/repositories/IKycDocumentRepository.js";

/** VerifyKycInput is an exported domains/partner contract/implementation; see the owning README for lifecycle and extension rules. */
export interface VerifyKycInput {
  documentId: number;
  adminUserId: number;
  approved: boolean;
  rejectionReason?: string;
}

/** VerifyPartnerKycDocumentUseCase is an exported domains/partner contract/implementation; see the owning README for lifecycle and extension rules. */
export class VerifyPartnerKycDocumentUseCase {
  constructor(private readonly kycRepository: IKycDocumentRepository) {}

  /** Executes this application operation through its declared ports and domain invariants. */
  public async execute(input: VerifyKycInput): Promise<KycDocument> {
    const document = await this.kycRepository.findById(input.documentId);
    if (!document) {
      throw new DomainError(
        `KYC Document with ID ${input.documentId} not found`,
      );
    }

    const newStatus: KycDocumentStatus = input.approved
      ? ("APPROVED" as KycDocumentStatus)
      : ("REJECTED" as KycDocumentStatus);

    return this.kycRepository.updateStatus(
      input.documentId,
      newStatus,
      input.adminUserId,
      input.approved
        ? null
        : input.rejectionReason || "Document verification failed",
    );
  }
}
