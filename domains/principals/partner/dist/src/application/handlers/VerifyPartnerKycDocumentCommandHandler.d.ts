import { KycDocument } from '../../domain/entities/KycDocument.js';
import { PrismaKycDocumentRepository } from '../../infrastructure/persistence/prisma/PrismaKycDocumentRepository.js';
export interface VerifyKycInput {
    documentId: number;
    adminUserId: number;
    approved: boolean;
    rejectionReason?: string;
}
export declare class VerifyPartnerKycDocumentCommandHandler {
    private readonly kycRepository;
    constructor(kycRepository: PrismaKycDocumentRepository);
    execute(input: VerifyKycInput): Promise<KycDocument>;
}
