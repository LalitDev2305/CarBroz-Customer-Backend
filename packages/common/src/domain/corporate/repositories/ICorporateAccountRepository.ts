import { CorporateAccount, CorporateAccountStatus } from '../CorporateAccount.js';

export interface ICorporateAccountRepository {
  create(account: CorporateAccount): Promise<CorporateAccount>;
  update(account: CorporateAccount): Promise<CorporateAccount>;
  findById(id: number): Promise<CorporateAccount | null>;
  findByPublicId(publicId: string): Promise<CorporateAccount | null>;
  findByGstin(gstin: string): Promise<CorporateAccount | null>;
  listByStatus(status?: CorporateAccountStatus, limit?: number, offset?: number): Promise<CorporateAccount[]>;
  updateUtilisedCredit(id: number, deltaPaise: bigint): Promise<CorporateAccount>;
}
