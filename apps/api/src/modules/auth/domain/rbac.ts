export enum AppRole {
  CUSTOMER = 'CUSTOMER',
  PARTNER = 'PARTNER',
  ADMIN = 'ADMIN',
}

export enum AppPermission {
  // Placeholder permissions
  USER_READ = 'USER_READ',
  USER_WRITE = 'USER_WRITE',
  BOOKING_READ = 'BOOKING_READ',
  BOOKING_CREATE = 'BOOKING_CREATE',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
}

export const RolePermissions: Record<AppRole, AppPermission[]> = {
  [AppRole.CUSTOMER]: [
    AppPermission.USER_READ,
    AppPermission.BOOKING_READ,
    AppPermission.BOOKING_CREATE,
  ],
  [AppRole.PARTNER]: [
    AppPermission.USER_READ,
    AppPermission.USER_WRITE,
    AppPermission.BOOKING_READ,
  ],
  [AppRole.ADMIN]: [
    AppPermission.SYSTEM_ADMIN,
  ],
};
