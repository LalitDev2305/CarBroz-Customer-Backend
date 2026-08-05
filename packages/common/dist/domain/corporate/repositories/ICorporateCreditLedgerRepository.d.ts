import { CorporateCreditLedger } from '../CorporateCreditLedger.js';
export interface ICorporateCreditLedgerRepository {
    create(entry: CorporateCreditLedger): Promise<CorporateCreditLedger>;
    findById(id: number): Promise<CorporateCreditLedger | null>;
    findByPublicId(publicId: string): Promise<CorporateCreditLedger | null>;
    listByAccountId(corporateAccountId: number, limit?: number, offset?: number): Promise<CorporateCreditLedger[]>;
    getLatestEntry(corporateAccountId: number): Promise<CorporateCreditLedger | null>;
}
