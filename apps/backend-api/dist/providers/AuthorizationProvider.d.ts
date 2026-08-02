import { IAuthorizationProvider, IAdminRoleRepository, IRoleRepository, IPermissionRepository } from '@carbroz/common';
export declare class AuthorizationProvider implements IAuthorizationProvider {
    private readonly adminRoleRepository;
    private readonly roleRepository;
    private readonly permissionRepository;
    constructor(adminRoleRepository: IAdminRoleRepository, roleRepository: IRoleRepository, permissionRepository: IPermissionRepository);
    hasPermission(userId: number, permissionKey: string): Promise<boolean>;
    hasAnyPermission(userId: number, permissionKeys: string[]): Promise<boolean>;
    hasAllPermissions(userId: number, permissionKeys: string[]): Promise<boolean>;
    getRoles(userId: number): Promise<string[]>;
}
