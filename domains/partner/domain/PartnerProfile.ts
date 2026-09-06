/** PartnerProfile is an exported domains/partner contract/implementation; see the owning README for lifecycle and extension rules. */
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
