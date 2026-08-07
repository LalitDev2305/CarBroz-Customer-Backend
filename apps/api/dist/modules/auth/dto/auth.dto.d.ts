export interface SendOtpRequestDto {
    mobileNumber: string;
}
export interface VerifyOtpRequestDto {
    mobileNumber: string;
    otp: string;
    deviceId: string;
    platform: string;
    appVersion: string;
}
export interface VerifyOtpResponseDto {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        roles: string[];
    };
}
export interface RefreshTokenRequestDto {
    refreshToken: string;
    deviceId: string;
}
export interface RefreshTokenResponseDto {
    accessToken: string;
    refreshToken: string;
}
export interface LogoutRequestDto {
    deviceId: string;
}
export interface CurrentUserResponseDto {
    id: string;
    mobileNumber: string;
    roles: string[];
}
