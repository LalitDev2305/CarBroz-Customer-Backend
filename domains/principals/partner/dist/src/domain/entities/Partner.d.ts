import { PartnerType } from '../enums/PartnerType.js';
import { PartnerStatus } from '../enums/PartnerStatus.js';
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
