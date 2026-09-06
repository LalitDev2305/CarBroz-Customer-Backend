-- CW5 Identity security hardening.
-- Legacy refresh credentials were stored in plaintext on UserSession and are intentionally invalidated.
UPDATE "UserSession"
SET "isRevoked" = true,
    "refreshToken" = NULL
WHERE "refreshToken" IS NOT NULL;

-- The historical RefreshToken table did not carry session/family state. It has no safe migration path
-- from opaque plaintext values, so all legacy rows are invalidated before the table is hardened.
DELETE FROM "RefreshToken";
DROP INDEX IF EXISTS "RefreshToken_token_key";

ALTER TABLE "RefreshToken" RENAME COLUMN "token" TO "tokenHash";
ALTER TABLE "RefreshToken"
  ADD COLUMN "sessionId" INTEGER NOT NULL,
  ADD COLUMN "familyId" TEXT NOT NULL,
  ADD COLUMN "expiresAt" TIMESTAMP(3) NOT NULL,
  ADD COLUMN "consumedAt" TIMESTAMP(3),
  ADD COLUMN "revokedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");
CREATE INDEX "RefreshToken_sessionId_familyId_idx" ON "RefreshToken"("sessionId", "familyId");
CREATE INDEX "RefreshToken_familyId_revokedAt_idx" ON "RefreshToken"("familyId", "revokedAt");

ALTER TABLE "RefreshToken"
  ADD CONSTRAINT "RefreshToken_sessionId_fkey"
  FOREIGN KEY ("sessionId") REFERENCES "UserSession"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserSession" DROP COLUMN "refreshToken";

CREATE TABLE "OtpChallenge" (
  "id" SERIAL NOT NULL,
  "publicId" TEXT NOT NULL,
  "phoneNumber" TEXT NOT NULL,
  "deviceId" TEXT NOT NULL,
  "otpHash" TEXT NOT NULL,
  "attemptCount" INTEGER NOT NULL DEFAULT 0,
  "maxAttempts" INTEGER NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "invalidatedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "OtpChallenge_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OtpChallenge_publicId_key" ON "OtpChallenge"("publicId");
CREATE INDEX "OtpChallenge_phoneNumber_createdAt_idx" ON "OtpChallenge"("phoneNumber", "createdAt");
CREATE INDEX "OtpChallenge_phoneNumber_deviceId_createdAt_idx" ON "OtpChallenge"("phoneNumber", "deviceId", "createdAt");
CREATE INDEX "OtpChallenge_expiresAt_idx" ON "OtpChallenge"("expiresAt");
