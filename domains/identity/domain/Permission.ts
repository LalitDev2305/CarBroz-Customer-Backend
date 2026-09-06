/** Permission is an exported domains/identity contract/implementation; see the owning README for lifecycle and extension rules. */
export interface Permission {
  id: number;
  publicId: string;
  key: string;
  module: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
