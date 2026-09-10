import { createContainer, asValue } from 'awilix';
import { describe, expect, it, vi } from 'vitest';
import { PrismaRoleRepository } from '../infrastructure/repositories/PrismaRoleRepository.js';
import { PrismaPermissionRepository } from '../infrastructure/repositories/PrismaPermissionRepository.js';
import { PrismaUserRepository } from '../infrastructure/repositories/PrismaUserRepository.js';
import { PrismaRefreshTokenRepository } from '../infrastructure/repositories/PrismaRefreshTokenRepository.js';
import { PrismaAdminRoleRepository } from '../infrastructure/repositories/PrismaAdminRoleRepository.js';
import { AuthorizationProvider } from '../infrastructure/authorization/AuthorizationProvider.js';
import { NodeAuthSecurityProvider } from '../infrastructure/security/NodeAuthSecurityProvider.js';
import { registerIdentityModule } from '../identity.module.js';

const dates = {
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-02T00:00:00.000Z'),
};
const roleRecord = (overrides: Record<string, unknown> = {}) => ({
  id: 1, publicId: 'role-1', name: 'ADMIN', description: null, isSystem: true,
  deletedAt: null, ...dates, ...overrides,
});
const permissionRecord = (overrides: Record<string, unknown> = {}) => ({
  id: 2, publicId: 'permission-2', key: 'partner.verify', module: 'partner', description: null,
  deletedAt: null, ...dates, ...overrides,
});
const userRecord = (overrides: Record<string, unknown> = {}) => ({
  id: 3, publicId: 'user-3', email: null, phoneNumber: '9876543210', isGuest: false,
  role: 'USER', deletedAt: null, ...dates, ...overrides,
});

describe('Identity infrastructure closeout behavior', () => {
  it('covers Role repository null/mapping, permissions, save branches and delete', async () => {
    const model = { findUnique: vi.fn(), findMany: vi.fn(), update: vi.fn(), create: vi.fn(), delete: vi.fn() };
    const repository = new PrismaRoleRepository({ role: model } as any);
    model.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(roleRecord()).mockResolvedValueOnce(null).mockResolvedValueOnce(roleRecord());
    await expect(repository.findById(1)).resolves.toBeNull();
    await expect(repository.findById(1)).resolves.toMatchObject({ name: 'ADMIN' });
    await expect(repository.findByName('missing')).resolves.toBeNull();
    await expect(repository.findByName('ADMIN')).resolves.toMatchObject({ id: 1 });
    model.findMany.mockResolvedValue([roleRecord()]);
    await expect(repository.findAll()).resolves.toHaveLength(1);
    model.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({ ...roleRecord(), permissions: [{ permissionId: 2 }, { permissionId: 5 }] });
    await expect(repository.findWithPermissions(1)).resolves.toBeNull();
    await expect(repository.findWithPermissions(1)).resolves.toMatchObject({ permissions: [2, 5] });
    model.update.mockResolvedValue(roleRecord({ name: 'MANAGER' }));
    await repository.save(roleRecord({ name: 'MANAGER' }) as any);
    model.create.mockResolvedValue(roleRecord({ id: 9 }));
    await repository.save({ ...roleRecord(), id: 0 } as any);
    model.delete.mockResolvedValue(roleRecord());
    await expect(repository.delete(1)).resolves.toBe(true);
  });

  it('covers Permission repository null/mapping, save branches and delete', async () => {
    const model = { findUnique: vi.fn(), findMany: vi.fn(), update: vi.fn(), create: vi.fn(), delete: vi.fn() };
    const repository = new PrismaPermissionRepository({ permission: model } as any);
    model.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(permissionRecord()).mockResolvedValueOnce(null).mockResolvedValueOnce(permissionRecord());
    await expect(repository.findById(2)).resolves.toBeNull();
    await expect(repository.findById(2)).resolves.toMatchObject({ key: 'partner.verify' });
    await expect(repository.findByKey('missing')).resolves.toBeNull();
    await expect(repository.findByKey('partner.verify')).resolves.toMatchObject({ id: 2 });
    model.findMany.mockResolvedValue([permissionRecord()]);
    await expect(repository.findAll()).resolves.toHaveLength(1);
    model.update.mockResolvedValue(permissionRecord());
    await repository.save(permissionRecord() as any);
    model.create.mockResolvedValue(permissionRecord({ id: 10 }));
    await repository.save({ ...permissionRecord(), id: 0 } as any);
    model.delete.mockResolvedValue(permissionRecord());
    await expect(repository.delete(2)).resolves.toBe(true);
  });

  it('covers User repository defaults, lookup, save/upsert and soft-delete outcomes', async () => {
    const model = { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), upsert: vi.fn() };
    const repository = new PrismaUserRepository({ user: model } as any);
    model.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(userRecord()).mockResolvedValueOnce(null).mockResolvedValueOnce(userRecord());
    await expect(repository.findById(3)).resolves.toBeNull();
    await expect(repository.findById(3)).resolves.toMatchObject({ id: 3 });
    model.findMany.mockResolvedValue([userRecord()]);
    await expect(repository.findAll()).resolves.toHaveLength(1);
    model.create.mockResolvedValue(userRecord());
    await repository.create({ phoneNumber: '9876543210' });
    expect(model.create).toHaveBeenLastCalledWith({ data: expect.objectContaining({ isGuest: false, role: 'USER' }) });
    model.create.mockResolvedValue(userRecord({ isGuest: true, role: 'ADMIN' }));
    await repository.create({ phoneNumber: '9876543210', isGuest: true, role: 'ADMIN' });
    model.update.mockResolvedValue(userRecord({ email: 'a@b.com' }));
    await repository.update(3, { email: 'a@b.com' });
    await repository.save(userRecord() as any);
    model.create.mockResolvedValue(userRecord({ id: 4 }));
    await repository.save({ ...userRecord(), id: 0 } as any);
    model.update.mockResolvedValueOnce(userRecord({ deletedAt: new Date() }));
    await expect(repository.delete(3)).resolves.toBe(true);
    model.update.mockRejectedValueOnce(new Error('missing'));
    await expect(repository.delete(3)).resolves.toBe(false);
    await expect(repository.findByPhoneNumber('missing')).resolves.toBeNull();
    await expect(repository.findByPhoneNumber('9876543210')).resolves.toMatchObject({ id: 3 });
    model.upsert.mockResolvedValue(userRecord());
    await repository.upsert('9876543210', {});
    expect(model.upsert).toHaveBeenLastCalledWith(expect.objectContaining({ create: expect.objectContaining({ isGuest: false, role: 'USER' }) }));
    await repository.upsert('9876543210', { isGuest: true, role: 'ADMIN' });
  });

  it('covers AdminRole repository assignment, removal and role listing', async () => {
    const model = { create: vi.fn(), delete: vi.fn(), findMany: vi.fn() };
    const repository = new PrismaAdminRoleRepository({ adminUserRole: model } as any);
    model.create.mockResolvedValue({ userId: 3, roleId: 1, assignedBy: 9, assignedAt: dates.createdAt });
    await expect(repository.assignRole(3, 1, 9)).resolves.toMatchObject({ userId: 3, roleId: 1, assignedBy: 9 });
    model.delete.mockResolvedValue({});
    await expect(repository.removeRole(3, 1)).resolves.toBe(true);
    model.findMany.mockResolvedValue([{ roleId: 1 }, { roleId: 2 }]);
    await expect(repository.findRolesForUser(3)).resolves.toEqual([1, 2]);
  });

  it('covers refresh token issue, rotation compromise states, success and revocation branches', async () => {
    const refreshToken = { updateMany: vi.fn(), create: vi.fn(), findUnique: vi.fn() };
    const userSession = { update: vi.fn(), updateMany: vi.fn(), findMany: vi.fn() };
    const tx = { refreshToken, userSession };
    const prisma = { $transaction: vi.fn((callback: (value: any) => unknown) => callback(tx)) } as any;
    const repository = new PrismaRefreshTokenRepository(prisma);
    const now = new Date('2026-01-01T00:00:00.000Z');
    const expires = new Date('2026-01-02T00:00:00.000Z');

    await repository.issue({ sessionId: 5, tokenHash: 'old', familyId: 'family', expiresAt: expires, now });
    expect(refreshToken.create).toHaveBeenCalled();

    const input = { currentTokenHash: 'old', replacementTokenHash: 'new', replacementExpiresAt: expires, deviceId: 'device-1', now };
    refreshToken.findUnique.mockResolvedValueOnce(null);
    await expect(repository.rotate(input)).resolves.toEqual({ status: 'INVALID' });

    const token = (overrides: Record<string, unknown> = {}) => ({
      id: 10, sessionId: 5, familyId: 'family', consumedAt: null, revokedAt: null, expiresAt: expires,
      session: { id: 5, deviceId: 'device-1', isRevoked: false, user: userRecord(), publicId: 'session-5', userId: 3, deviceModel: null, osVersion: null, fcmToken: null, lastActiveAt: now, createdAt: now, updatedAt: now, deletedAt: null },
      ...overrides,
    });
    refreshToken.findUnique.mockResolvedValueOnce(token({ session: { ...token().session, deviceId: 'other' } }));
    await expect(repository.rotate(input)).resolves.toEqual({ status: 'DEVICE_MISMATCH' });
    refreshToken.findUnique.mockResolvedValueOnce(token({ consumedAt: now }));
    await expect(repository.rotate(input)).resolves.toEqual({ status: 'REUSED' });
    refreshToken.findUnique.mockResolvedValueOnce(token({ expiresAt: new Date('2025-12-31T00:00:00.000Z') }));
    await expect(repository.rotate(input)).resolves.toEqual({ status: 'EXPIRED' });
    refreshToken.findUnique.mockResolvedValueOnce(token());
    refreshToken.updateMany.mockResolvedValueOnce({ count: 0 });
    await expect(repository.rotate(input)).resolves.toEqual({ status: 'REUSED' });
    refreshToken.findUnique.mockResolvedValueOnce(token());
    refreshToken.updateMany.mockResolvedValueOnce({ count: 1 });
    userSession.update.mockResolvedValue(token().session);
    await expect(repository.rotate(input)).resolves.toMatchObject({ status: 'ROTATED', session: { id: 5, deviceId: 'device-1' } });

    await repository.revokeSession(5, now);
    userSession.findMany.mockResolvedValueOnce([]);
    await repository.revokeAllForUser(3, now);
    userSession.findMany.mockResolvedValueOnce([{ id: 5 }, { id: 6 }]);
    await repository.revokeAllForUser(3, now);
  });

  it('covers RBAC super-admin, missing permission, matching permission and collection helpers', async () => {
    const adminRoles = { findRolesForUser: vi.fn() } as any;
    const roles = { findWithPermissions: vi.fn(), findById: vi.fn() } as any;
    const permissions = { findByKey: vi.fn() } as any;
    const provider = new AuthorizationProvider(adminRoles, roles, permissions);

    adminRoles.findRolesForUser.mockResolvedValueOnce([]);
    await expect(provider.hasPermission(3, 'x')).resolves.toBe(false);
    adminRoles.findRolesForUser.mockResolvedValueOnce([1]);
    roles.findWithPermissions.mockResolvedValueOnce({ id: 1, name: 'SUPER_ADMIN', permissions: [] });
    await expect(provider.hasPermission(3, 'x')).resolves.toBe(true);
    adminRoles.findRolesForUser.mockResolvedValueOnce([1]);
    roles.findWithPermissions.mockResolvedValueOnce({ id: 1, name: 'ADMIN', permissions: [] });
    permissions.findByKey.mockResolvedValueOnce(null);
    await expect(provider.hasPermission(3, 'missing')).resolves.toBe(false);
    adminRoles.findRolesForUser.mockResolvedValueOnce([1]);
    roles.findWithPermissions.mockResolvedValueOnce({ id: 1, name: 'ADMIN', permissions: [] }).mockResolvedValueOnce({ id: 1, name: 'ADMIN', permissions: [2] });
    permissions.findByKey.mockResolvedValueOnce({ id: 2 });
    await expect(provider.hasPermission(3, 'partner.verify')).resolves.toBe(true);

    vi.spyOn(provider, 'hasPermission').mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    await expect(provider.hasAnyPermission(3, ['a', 'b'])).resolves.toBe(true);
    vi.spyOn(provider, 'hasPermission').mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    await expect(provider.hasAllPermissions(3, ['a', 'b'])).resolves.toBe(false);

    adminRoles.findRolesForUser.mockResolvedValueOnce([1, 2]);
    roles.findById.mockResolvedValueOnce({ name: 'ADMIN' }).mockResolvedValueOnce(null);
    await expect(provider.getRoles(3)).resolves.toEqual(['ADMIN']);
  });

  it('covers Node auth security validation and successful secret verification', async () => {
    const provider = new NodeAuthSecurityProvider();
    expect(() => provider.generateOtp(3)).toThrow(RangeError);
    expect(provider.generateOtp(4)).toMatch(/^\d{4}$/);
    expect(() => provider.generateRefreshToken(31)).toThrow(RangeError);
    expect(provider.generateRefreshToken(32)).toBeTruthy();
    expect(provider.hashRefreshToken('token')).toHaveLength(64);
    expect(provider.generateTokenFamilyId()).toBeTruthy();
    await expect(provider.verifySecret('secret', 'bad')).resolves.toBe(false);
    await expect(provider.verifySecret('secret', 'scrypt$salt$aa')).resolves.toBe(false);
    const hash = await provider.hashSecret('secret');
    await expect(provider.verifySecret('secret', hash)).resolves.toBe(true);
    await expect(provider.verifySecret('wrong', hash)).resolves.toBe(false);
  });

  it('executes Identity DI repository factories against the canonical Prisma provider', () => {
    const container = createContainer();
    container.register({ prismaProvider: asValue({ getClient: () => ({}) }) });
    registerIdentityModule(container as any);
    expect(container.resolve('userRepository')).toBeDefined();
    expect(container.resolve('userSessionRepository')).toBeDefined();
    expect(container.resolve('refreshTokenRepository')).toBeDefined();
    expect(container.resolve('roleRepository')).toBeDefined();
    expect(container.resolve('permissionRepository')).toBeDefined();
    expect(container.resolve('adminRoleRepository')).toBeDefined();
    expect(container.resolve('authSecurityProvider')).toBeDefined();
  });
});
