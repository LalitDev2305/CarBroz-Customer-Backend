/** Role is an exported domains/identity contract/implementation; see the owning README for lifecycle and extension rules. */
export interface Role {
  id: number;
  publicId: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
