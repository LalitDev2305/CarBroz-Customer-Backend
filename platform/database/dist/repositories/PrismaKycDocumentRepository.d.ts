import { KycDocument, IKycDocumentRepository, KycDocumentStatus } from '@carbroz/common';
import { PrismaProvider } from '../providers/PrismaProvider.js';
export declare class PrismaKycDocumentRepository implements IKycDocumentRepository {
    private readonly prismaProvider;
    constructor(prismaProvider: PrismaProvider);
    private get client();
    private mapToDomain;
    findById(id: number): Promise<KycDocument | null>;
    findByPartnerId(partnerId: number): Promise<KycDocument[]>;
    findByPartnerIdAndStatus(partnerId: number, status: KycDocumentStatus): Promise<KycDocument[]>;
    create(document: Omit<KycDocument, 'id' | 'publicId' | 'createdAt' | 'updatedAt'>): Promise<KycDocument>;
    update(id: number, data: Partial<KycDocument>): Promise<KycDocument>;
    updateStatus(id: number, status: KycDocumentStatus, verifiedById: number, rejectionReason?: string | null): Promise<KycDocument>;
    delete(id: number): Promise<boolean>;
    findAll(): Promise<KycDocument[]>;
    save(entity: KycDocument): Promise<KycDocument>;
}
//# sourceMappingURL=PrismaKycDocumentRepository.d.ts.map