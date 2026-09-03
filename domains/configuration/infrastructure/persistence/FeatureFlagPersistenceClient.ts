export interface FeatureFlagPersistenceRecord {
  id: number;
  publicId: string;
  key: string;
  enabled: boolean;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface FeatureFlagPersistenceClient {
  featureFlag: {
    findUnique(args: { where: { id?: number; key?: string; deletedAt?: null } }): Promise<FeatureFlagPersistenceRecord | null>;
    findMany(args?: { where?: { deletedAt?: null } }): Promise<FeatureFlagPersistenceRecord[]>;
    update(args: { where: { id: number }; data: Record<string, unknown> }): Promise<FeatureFlagPersistenceRecord>;
  };
}

export interface FeatureFlagPersistenceProvider {
  getClient(): FeatureFlagPersistenceClient;
}
