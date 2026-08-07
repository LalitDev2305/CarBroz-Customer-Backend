import { KycDocument } from '../domain/KycDocument.js';
import { PrismaKycDocumentRepository } from '../infrastructure/repositories/PrismaKycDocumentRepository.js';
export interface VerifyKycInput {
    documentId: number;
    adminUserId: number;
    approved: boolean;
    rejectionReason?: string;
}
export declare class VerifyPartnerKycDocumentUseCase {
    private readonly kycRepository;
    constructor(kycRepository: PrismaKycDocumentRepository);
    execute(input: VerifyKycInput): Promise<KycDocument>;
}
//# sourceMappingURL=VerifyPartnerKycDocumentUseCase.d.ts.map