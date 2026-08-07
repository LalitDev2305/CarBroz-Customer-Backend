export interface JwtPayload {
    sub?: string;
    id: string;
    phone: string;
    roles: string[];
    iat?: number;
    exp?: number;
    iss?: string;
    aud?: string;
}
export interface IJwtService {
    signAccessToken(payload: Partial<JwtPayload>): Promise<string>;
    signRefreshToken(payload: Partial<JwtPayload>): Promise<string>;
    verifyAccessToken(token: string): Promise<JwtPayload>;
    verifyRefreshToken(token: string): Promise<JwtPayload>;
}
