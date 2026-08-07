import { KycDocument } from '../entities/KycDocument.js';
export interface KycDocumentRepository {
    findById(id: number): Promise<KycDocument | null>;
    findByPartnerId(partnerId: number): Promise<KycDocument[]>;
    save(document: KycDocument): Promise<KycDocument>;
}
