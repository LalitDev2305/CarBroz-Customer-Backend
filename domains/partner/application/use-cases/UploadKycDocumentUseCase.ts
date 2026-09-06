import { DomainError } from "@carbroz/foundation-kernel";
import type { ExecutionContext, IUseCase } from "@carbroz/foundation-kernel";
import type { IPartnerMemberRepository } from "../../domain/repositories/IPartnerMemberRepository.js";
import type { KycDocumentType } from "../../kyc/domain/KycDocumentType.js";
import type { UploadPartnerKycDocumentUseCase } from "../../kyc/application/UploadPartnerKycDocumentUseCase.js";

export interface UploadKycDocumentInput {
  context: ExecutionContext;
  data: {
    partnerId: number;
    type: KycDocumentType;
    fileName?: string;
    fileBuffer: Buffer;
    mimeType: string;
  };
}

export class UploadKycDocumentUseCase implements IUseCase<
  UploadKycDocumentInput,
  void
> {
  constructor(
    private readonly uploader: UploadPartnerKycDocumentUseCase,
    private readonly partnerMemberRepository: IPartnerMemberRepository,
  ) {}

  async execute({ context, data }: UploadKycDocumentInput): Promise<void> {
    const userId = Number(context.actor?.id);
    if (!Number.isInteger(userId) || userId <= 0)
      throw new DomainError("UNAUTHORIZED: User must be logged in");
    const membership =
      await this.partnerMemberRepository.findByUserIdAndPartnerId(
        userId,
        data.partnerId,
      );
    if (!membership || !["OWNER", "MANAGER"].includes(membership.role)) {
      throw new DomainError(
        "FORBIDDEN: Only owners or managers can upload KYC documents",
      );
    }
    await this.uploader.execute({
      partnerId: data.partnerId,
      uploadedById: userId,
      type: data.type,
      fileName: data.fileName ?? "kyc-document",
      fileBuffer: data.fileBuffer,
      mimeType: data.mimeType,
    });
  }
}
