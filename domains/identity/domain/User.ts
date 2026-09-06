/** User is an exported domains/identity contract/implementation; see the owning README for lifecycle and extension rules. */
export interface User {
  id: number;
  publicId: string;
  email: string | null;
  phoneNumber: string | null;
  isGuest: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
