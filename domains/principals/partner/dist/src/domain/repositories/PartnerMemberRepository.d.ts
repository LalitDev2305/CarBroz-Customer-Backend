import { PartnerMember } from '../entities/PartnerMember.js';
export interface PartnerMemberRepository {
    findByPartnerId(partnerId: number): Promise<PartnerMember[]>;
    findByUserId(userId: number): Promise<PartnerMember | null>;
}
