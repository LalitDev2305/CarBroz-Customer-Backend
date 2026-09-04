import type { PartnerMemberRole } from './PartnerMemberRole.js';
import type { PartnerMemberStatus } from './PartnerMemberStatus.js';

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
