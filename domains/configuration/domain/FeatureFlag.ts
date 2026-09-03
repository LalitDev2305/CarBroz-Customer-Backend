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
