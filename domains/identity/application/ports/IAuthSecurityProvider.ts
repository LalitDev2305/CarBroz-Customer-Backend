export interface IAuthSecurityProvider {
  generateOtp(length: number): string;
  hashSecret(secret: string): Promise<string>;
  verifySecret(secret: string, encodedHash: string): Promise<boolean>;
  generateRefreshToken(bytes: number): string;
  hashRefreshToken(token: string): string;
  generateTokenFamilyId(): string;
}
