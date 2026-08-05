import { PartnerType } from './PartnerType.js';
import { PartnerStatus } from './PartnerStatus.js';
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
//# sourceMappingURL=Partner.d.ts.map