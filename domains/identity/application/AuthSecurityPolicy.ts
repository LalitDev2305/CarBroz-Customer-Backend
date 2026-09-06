export const AUTH_SECURITY_POLICY = Object.freeze({
  otp: Object.freeze({
    length: 6,
    ttlMs: 5 * 60 * 1000,
    maxAttempts: 5,
    resendCooldownMs: 60 * 1000,
    rateLimitWindowMs: 15 * 60 * 1000,
    maxChallengesPerWindow: 5,
  }),
  refresh: Object.freeze({
    tokenBytes: 32,
    ttlMs: 7 * 24 * 60 * 60 * 1000,
  }),
});
