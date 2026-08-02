import { describe, it, expect } from 'vitest';
import { requireRole, requirePermission } from '../../../middlewares/rbac.middleware.js';
import { AppRole, AppPermission } from '../domain/rbac.js';
import { ForbiddenError } from '@carbroz/common';
describe('RBAC Middleware', () => {
    describe('requireRole', () => {
        it('should throw ForbiddenError if user has no role', async () => {
            const middleware = requireRole([AppRole.ADMIN]);
            const mockRequest = { user: {} };
            const mockReply = {};
            await expect(middleware(mockRequest, mockReply)).rejects.toThrow(ForbiddenError);
        });
        it('should pass if user has required role', async () => {
            const middleware = requireRole([AppRole.CUSTOMER]);
            const mockRequest = { user: { roles: [AppRole.CUSTOMER] } };
            const mockReply = {};
            await expect(middleware(mockRequest, mockReply)).resolves.toBeUndefined();
        });
    });
    describe('requirePermission', () => {
        it('should pass if user role grants permission', async () => {
            const middleware = requirePermission([AppPermission.USER_READ]);
            const mockRequest = { user: { roles: [AppRole.CUSTOMER] } };
            const mockReply = {};
            await expect(middleware(mockRequest, mockReply)).resolves.toBeUndefined();
        });
        it('should throw ForbiddenError if user role lacks permission', async () => {
            const middleware = requirePermission([AppPermission.SYSTEM_ADMIN]);
            const mockRequest = { user: { roles: [AppRole.CUSTOMER] } };
            const mockReply = {};
            await expect(middleware(mockRequest, mockReply)).rejects.toThrow(ForbiddenError);
        });
    });
});
//# sourceMappingURL=rbac.middleware.spec.js.map