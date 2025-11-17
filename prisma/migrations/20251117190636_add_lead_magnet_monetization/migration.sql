-- AddColumn: priceInPoints to LeadMagnet
ALTER TABLE "LeadMagnet" ADD COLUMN IF NOT EXISTS "priceInPoints" INTEGER;

-- CreateTable: LeadMagnetPurchase
CREATE TABLE IF NOT EXISTS "LeadMagnetPurchase" (
    "id" TEXT NOT NULL,
    "leadMagnetId" TEXT NOT NULL,
    "specialistProfileId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "priceInPoints" INTEGER NOT NULL,
    "pointsSpent" DECIMAL(15,2) NOT NULL,
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadMagnetPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LeadMagnetPurchase_leadMagnetId_idx" ON "LeadMagnetPurchase"("leadMagnetId");
CREATE INDEX IF NOT EXISTS "LeadMagnetPurchase_specialistProfileId_idx" ON "LeadMagnetPurchase"("specialistProfileId");
CREATE INDEX IF NOT EXISTS "LeadMagnetPurchase_userId_idx" ON "LeadMagnetPurchase"("userId");
CREATE INDEX IF NOT EXISTS "LeadMagnetPurchase_createdAt_idx" ON "LeadMagnetPurchase"("createdAt");

-- CreateUniqueIndex
CREATE UNIQUE INDEX IF NOT EXISTS "LeadMagnetPurchase_transactionId_key" ON "LeadMagnetPurchase"("transactionId");

-- AddForeignKey
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'LeadMagnetPurchase_leadMagnetId_fkey'
    ) THEN
        ALTER TABLE "LeadMagnetPurchase" ADD CONSTRAINT "LeadMagnetPurchase_leadMagnetId_fkey" 
        FOREIGN KEY ("leadMagnetId") REFERENCES "LeadMagnet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'LeadMagnetPurchase_specialistProfileId_fkey'
    ) THEN
        ALTER TABLE "LeadMagnetPurchase" ADD CONSTRAINT "LeadMagnetPurchase_specialistProfileId_fkey" 
        FOREIGN KEY ("specialistProfileId") REFERENCES "SpecialistProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'LeadMagnetPurchase_userId_fkey'
    ) THEN
        ALTER TABLE "LeadMagnetPurchase" ADD CONSTRAINT "LeadMagnetPurchase_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

