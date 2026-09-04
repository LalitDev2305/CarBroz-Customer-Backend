import type { PartnerType } from './PartnerType.js';
import type { PartnerStatus } from './PartnerStatus.js';

export interface Partner {
  id: number;
  publicId: string;
  businessName: string;
  type: PartnerType;
  status: PartnerStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
