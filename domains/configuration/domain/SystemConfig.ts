/** SystemConfig is an exported domains/configuration contract/implementation; see the owning README for lifecycle and extension rules. */
export interface SystemConfig {
  id: number;
  publicId: string;
  key: string;
  value: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
