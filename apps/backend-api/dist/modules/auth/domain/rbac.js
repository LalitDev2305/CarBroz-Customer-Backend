export var AppRole;
(function (AppRole) {
    AppRole["CUSTOMER"] = "CUSTOMER";
    AppRole["PARTNER"] = "PARTNER";
    AppRole["ADMIN"] = "ADMIN";
})(AppRole || (AppRole = {}));
export var AppPermission;
(function (AppPermission) {
    // Placeholder permissions
    AppPermission["USER_READ"] = "USER_READ";
    AppPermission["USER_WRITE"] = "USER_WRITE";
    AppPermission["BOOKING_READ"] = "BOOKING_READ";
    AppPermission["BOOKING_CREATE"] = "BOOKING_CREATE";
    AppPermission["SYSTEM_ADMIN"] = "SYSTEM_ADMIN";
})(AppPermission || (AppPermission = {}));
export const RolePermissions = {
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
//# sourceMappingURL=rbac.js.map