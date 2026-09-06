/** AdminUserRole is an exported domains/identity contract/implementation; see the owning README for lifecycle and extension rules. */
export interface AdminUserRole {
  userId: number;
  roleId: number;
  assignedBy: number | null;
  assignedAt: Date;
}
