import { PartnerMemberRole } from './PartnerMemberRole.js';
import { PartnerMemberStatus } from './PartnerMemberStatus.js';
export interface PartnerMember {
    id: number;
    publicId: string;
    userId: number;
    partnerId: number;
    role: PartnerMemberRole;
    status: PartnerMemberStatus;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=PartnerMember.d.ts.map