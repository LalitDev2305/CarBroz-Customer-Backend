/** IAuthorizationProvider is an exported domains/identity contract/implementation; see the owning README for lifecycle and extension rules. */
export interface IAuthorizationProvider {
  hasPermission(userId: number, permissionKey: string): Promise<boolean>;
  hasAnyPermission(userId: number, permissionKeys: string[]): Promise<boolean>;
  hasAllPermissions(userId: number, permissionKeys: string[]): Promise<boolean>;
  getRoles(userId: number): Promise<string[]>;
}
