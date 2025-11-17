-- AlterTable
ALTER TABLE "SpecialistProfile" ADD COLUMN IF NOT EXISTS "profileType" TEXT NOT NULL DEFAULT 'specialist';

-- AlterTable
ALTER TABLE "SpecialistProfile" ADD COLUMN IF NOT EXISTS "companyName" TEXT;

-- AlterTable
ALTER TABLE "SpecialistProfile" ADD COLUMN IF NOT EXISTS "address" TEXT;

-- AlterTable
ALTER TABLE "SpecialistProfile" ADD COLUMN IF NOT EXISTS "addressCoordinates" JSONB;

-- AlterTable
ALTER TABLE "SpecialistProfile" ADD COLUMN IF NOT EXISTS "taxId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SpecialistProfile_profileType_idx" ON "SpecialistProfile"("profileType");

