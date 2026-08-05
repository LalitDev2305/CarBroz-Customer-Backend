import { CorporateMember } from '../CorporateMember.js';

export interface ICorporateMemberRepository {
  create(member: CorporateMember): Promise<CorporateMember>;
  update(member: CorporateMember): Promise<CorporateMember>;
  findById(id: number): Promise<CorporateMember | null>;
  findByPublicId(publicId: string): Promise<CorporateMember | null>;
  findByAccountAndUser(corporateAccountId: number, userId: number): Promise<CorporateMember | null>;
  findByUserId(userId: number): Promise<CorporateMember | null>;
  listByAccountId(corporateAccountId: number): Promise<CorporateMember[]>;
  delete(id: number): Promise<void>;
}
