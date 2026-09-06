/** FeatureFlag is an exported domains/configuration contract/implementation; see the owning README for lifecycle and extension rules. */
export interface FeatureFlag {
  id: number;
  publicId: string;
  key: string;
  enabled: boolean;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
