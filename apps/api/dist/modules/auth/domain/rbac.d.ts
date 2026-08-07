export declare enum AppRole {
    CUSTOMER = "CUSTOMER",
    PARTNER = "PARTNER",
    ADMIN = "ADMIN"
}
export declare enum AppPermission {
    USER_READ = "USER_READ",
    USER_WRITE = "USER_WRITE",
    BOOKING_READ = "BOOKING_READ",
    BOOKING_CREATE = "BOOKING_CREATE",
    SYSTEM_ADMIN = "SYSTEM_ADMIN"
}
export declare const RolePermissions: Record<AppRole, AppPermission[]>;
