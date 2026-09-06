import type { PartnerMemberRole } from './PartnerMemberRole.js';
import type { PartnerMemberStatus } from './PartnerMemberStatus.js';

/** PartnerMember is an exported domains/partner contract/implementation; see the owning README for lifecycle and extension rules. */
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
