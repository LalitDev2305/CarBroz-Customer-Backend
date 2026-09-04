export interface PartnerProfile {
  id: number;
  publicId: string;
  partnerId: number;
  description?: string | null;
  logoUrl?: string | null;
  supportEmail?: string | null;
  supportPhone?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
