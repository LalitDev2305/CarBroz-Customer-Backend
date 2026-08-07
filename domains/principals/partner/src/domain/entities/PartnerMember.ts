import { PartnerMemberRole } from '../enums/PartnerMemberRole.js';
import { PartnerMemberStatus } from '../enums/PartnerMemberStatus.js';

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
