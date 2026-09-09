-- Phase 11: production OTP challenge persistence is Redis-only behind IOtpChallengeRepository.
-- This table is no longer read or written by runtime code and is intentionally retired forward-only.
DROP TABLE IF EXISTS "OtpChallenge";
