export interface IAuthorizationProvider {
    hasPermission(userId: number, permissionKey: string): Promise<boolean>;
    hasAnyPermission(userId: number, permissionKeys: string[]): Promise<boolean>;
    hasAllPermissions(userId: number, permissionKeys: string[]): Promise<boolean>;
    getRoles(userId: number): Promise<string[]>;
}
