import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthorizationProvider } from './AuthorizationProvider.js';
import { IAdminRoleRepository, IRoleRepository, IPermissionRepository } from '@carbroz/common';

describe('AuthorizationProvider', () => {
  let adminRoleRepo: any;
  let roleRepo: any;
  let permissionRepo: any;
  let provider: AuthorizationProvider;

  beforeEach(() => {
    adminRoleRepo = {
      findRolesForUser: vi.fn(),
    };
    roleRepo = {
      findWithPermissions: vi.fn(),
      findById: vi.fn(),
    };
    permissionRepo = {
      findByKey: vi.fn(),
    };
    provider = new AuthorizationProvider(
      adminRoleRepo as unknown as IAdminRoleRepository,
      roleRepo as unknown as IRoleRepository,
      permissionRepo as unknown as IPermissionRepository
    );
  });

  it('should return false if user has no roles', async () => {
    adminRoleRepo.findRolesForUser.mockResolvedValue([]);
    const result = await provider.hasPermission(1, 'some.permission');
    expect(result).toBe(false);
  });

  it('should return true if user is SUPER_ADMIN', async () => {
    adminRoleRepo.findRolesForUser.mockResolvedValue([100]);
    roleRepo.findWithPermissions.mockResolvedValue({ name: 'SUPER_ADMIN', permissions: [] });
    
    const result = await provider.hasPermission(1, 'any.permission');
    expect(result).toBe(true);
  });

  it('should return true if user has the specific permission', async () => {
    adminRoleRepo.findRolesForUser.mockResolvedValue([100]);
    roleRepo.findWithPermissions.mockResolvedValue({ name: 'OPERATIONS_ADMIN', permissions: [200] });
    permissionRepo.findByKey.mockResolvedValue({ id: 200, key: 'test.permission' });

    const result = await provider.hasPermission(1, 'test.permission');
    expect(result).toBe(true);
  });

  it('should return false if user does not have the specific permission', async () => {
    adminRoleRepo.findRolesForUser.mockResolvedValue([100]);
    roleRepo.findWithPermissions.mockResolvedValue({ name: 'OPERATIONS_ADMIN', permissions: [300] });
    permissionRepo.findByKey.mockResolvedValue({ id: 200, key: 'test.permission' });

    const result = await provider.hasPermission(1, 'test.permission');
    expect(result).toBe(false);
  });

  it('should check any permission', async () => {
    vi.spyOn(provider, 'hasPermission')
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    const result = await provider.hasAnyPermission(1, ['perm1', 'perm2']);
    expect(result).toBe(true);
  });

  it('should check all permissions', async () => {
    vi.spyOn(provider, 'hasPermission')
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    const result = await provider.hasAllPermissions(1, ['perm1', 'perm2']);
    expect(result).toBe(false);
  });

  it('should get roles for user', async () => {
    adminRoleRepo.findRolesForUser.mockResolvedValue([10, 20]);
    roleRepo.findById
      .mockResolvedValueOnce({ name: 'ROLE_1' })
      .mockResolvedValueOnce({ name: 'ROLE_2' });

    const result = await provider.getRoles(1);
    expect(result).toEqual(['ROLE_1', 'ROLE_2']);
  });
});
