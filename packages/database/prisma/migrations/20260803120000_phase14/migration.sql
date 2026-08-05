-- CreateEnum
CREATE TYPE "SduiScreenStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- DropIndex
DROP INDEX IF EXISTS "SduiScreen_screenId_targetApp_key";

-- AlterTable
ALTER TABLE "SduiScreen" RENAME COLUMN "version" TO "version_number";
ALTER TABLE "SduiScreen" DROP COLUMN IF EXISTS "isPublished";
ALTER TABLE "SduiScreen" ADD COLUMN "status" "SduiScreenStatus" NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "SduiScreen" ADD COLUMN "lock_version" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "SduiScreen" ADD COLUMN "published_at" TIMESTAMP(3);
ALTER TABLE "SduiScreen" ADD COLUMN "published_by" TEXT;
ALTER TABLE "SduiScreen" ADD COLUMN "created_from_version" INTEGER;
ALTER TABLE "SduiScreen" ADD COLUMN "change_description" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "SduiScreen_screenId_targetApp_version_number_key" ON "SduiScreen"("screenId", "targetApp", "version_number");

-- CreateIndex
CREATE INDEX "SduiScreen_screenId_targetApp_status_idx" ON "SduiScreen"("screenId", "targetApp", "status");
