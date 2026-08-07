export interface AdminUserRole {
  userId: number;
  roleId: number;
  assignedBy: number | null;
  assignedAt: Date;
}
