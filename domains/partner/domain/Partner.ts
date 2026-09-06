import type { PartnerType } from './PartnerType.js';
import type { PartnerStatus } from './PartnerStatus.js';

/** Partner is an exported domains/partner contract/implementation; see the owning README for lifecycle and extension rules. */
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
