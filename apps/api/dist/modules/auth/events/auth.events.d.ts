export interface OTPRequestedEvent {
    mobileNumber: string;
    requestedAt: Date;
}
export interface UserLoggedInEvent {
    userId: string;
    deviceId: string;
    loggedInAt: Date;
}
export interface UserLoggedOutEvent {
    userId: string;
    deviceId: string;
    loggedOutAt: Date;
}
export interface RefreshTokenRotatedEvent {
    userId: string;
    deviceSessionId: string;
    rotatedAt: Date;
}
export interface SessionExpiredEvent {
    userId: string;
    deviceSessionId: string;
    expiredAt: Date;
}
